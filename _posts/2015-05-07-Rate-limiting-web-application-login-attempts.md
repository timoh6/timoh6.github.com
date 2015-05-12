---
layout: post
title: "Rate-limiting web application login attempts"
---

{{ page.title }}
================

How can I "throttle logins" or "how can I rate-limit login attempts" is a common question raised from time to time among web application developers.

In this post I describe one possible way to implement a *self-contained* (server-side) and secure rate-limiting mechanism for web applications (browser-server interaction).

## Why should we rate-limit login attempts?

In an ideal situation, rate-limiting login attempts would be a waste of time and resources. In the ideal situation, all credential holders of your system would be using a password/pasphrase (or an equivalent) which is strong enough to make it impossible for anyone to guess a single credential, even if they could fire huge amounts of tries against your login mechanism.

If you used a "password" which has, say, 2^128 worth of [guessing entropy](http://www.lysator.liu.se/~jc/mthesis/4_Entropy.html#SECTION00430000000000000000) strength, no one could throw enough login attempts to guess the right password. The adversary would be only wasting her time.

In reality, the situation is usually far from ideal. Passwords like "Password3" and so on are easy to crack offline, but such passwords, and especially without rate-limiting, are also feasible to crack online.

This is why arguably most online systems employing credentials should make sure they make the adversary's job guessing a correct credential as hard as possible. Which can be read as *as time consuming as possible*.

## Threat models

* Attacks against a single target from single source
* Attacks against a single target from multiple sources
* Attacks against multiple targets from a single source
* Attacks against multiple targets from multiple sources

It is difficult to act against adversary who tries a few "most common passwords" from many different sources against every account on the system, but we can focus especially on the "multiple source against single account" and "single source" threats. 

If we assume the adversary can mount the login attempts from, say, thousands of unique IP addresses and we do not want to lock the target account (permanently), we must make sure it takes as long as possible to try all the candidate passwords the adversary holds. And we want to do this in such a manner which does not consume endlessly our login server resources (recall rate-limiting with `sleep()` PHP function).

## Per-source rate-limits

Unfortunately it is presumably impossible to delay the adversary while never (temporarily) locking out the actual account owner, too. But we can adopt same kind of per-source rate-limit and global rate-limit approach used in [popa3d](http://www.openwall.com/popa3d/) to the web environment, to make online password guessing as slow as possible.

We need to set a limit for authentication attempts tied to the source IP address and source IP address block. In general, the limit for the IP address block (say, 123.123.123.1 - 123.123.123.254) will be greater than the limit for a single IP address.
 
We could allow max. *25 attempts* per single IP address and *100 attempts* per `/24 IPv4` block within the last **10 seconds**. Especially the 100 attempts limit against a /24 block is relatively pessimistic (assuming the adversary has such IP address block(s) in her control). Also, people behind NAT or sharing a proxy may encounter problems with the 25 attempts limit. Make sure you adjust these numbers for your situation.

IPv6 addresses are probably good to address in `/64` or `/56` blocks.

**Note** you may want to disallow all (login) requests from you local private network.

## Per-account rate-limits

We can also measure attempts against a specific account coming from multiple IP blocks (i.e. from a botnet spanning to hundreds or thousands computers around the world) and thus set *per-account* rate-limit.
 
For example, allow max. *5 distinct IP blocks* to try to login against a single account within the last **10 seconds**. The "5 distinct IP blocks" in this example is set to make it harder to harass the account owner by not letting him to login by sending bogus passwords for their username.

## Global rate-limits

In addition to the per-source and per-account limits, we can measure attempts globally to make sure any attack (attack which isn't already caught by the above rate-limits) can't run faster than X we set.

We could allow max. 300 login attempts (no matter where they are coming from or what account they are targeting) within the last **10 seconds**.

This sets the "guaranteed upper bound rate" an adversary can at most try the candidate passwords (per 10 seconds in this article). I.e. an attack coming from thousands of unique IP blocks and targeting several accounts can't proceed faster than this global limit allows.

## Log database

The database structure for the "login_log" table could look like this:

{% highlight sql %}
`username` varchar(100) NOT NULL,
`remote_ip` varbinary(16) NOT NULL,
`remote_ip_block` varbinary(16) NOT NULL,
`login_attempt_time` datetime NOT NULL,
KEY `remote_ip` (`remote_ip`),
KEY `remote_ip_block` (`remote_ip_block`),
KEY `login` (`login`),
KEY `time` (`login_attempt_time`)
{% endhighlight %}

Note we use field `remote_ip_block` to indicate the *IP block* the request came from. For example, if the request comes from address *123.123.123.123*, we'll store `inet_pton('123.123.123.0')` (in PHP) as the IP block. This is used to query distinct IP blocks when calculating per-account rate-limit. With *IPv6* This ought to be the same value as stored in the `remote_ip` field.

First, when a login request arrives, we'll check if it is allowed to attempts a login:

{% highlight sql %}
SELECT
SUM(1) AS global_attempt_count,
SUM(CASE WHEN remote_ip = ? THEN 1 ELSE 0 END) AS ip_attempt_count,
SUM(CASE WHEN (remote_ip BETWEEN ? AND ?) THEN 1 ELSE 0 END) AS ip_block_attempt_count,
(SELECT COUNT(DISTINCT remote_ip_block) FROM login_log WHERE username=? AND login_attempt_time >= (NOW() - INTERVAL 10 SECOND )) AS username_attempt_count
FROM login_log
WHERE
login_attempt_time >= (NOW() - INTERVAL 10 second) # All login attempts within the last 10 seconds
{% endhighlight %}

This gives us `global_attempt_count`, `ip_attempt_count`, `ip_block_attempt_count`, and `username_attempt_count`.

If *global_attempt_count* is greater than **300** or 
if *ip_attempt_count* is greater than **25** or
if *ip_block_attempt_count* is greater than **100** or
if *username_attempt_count* is greater than **5**
**reject the login**.

This makes the adversary to wait (or change source addresses or target account).

Unfortunately it also affects the actual account holder or an user who is trying to login from the same source address or block where the attack is running. But as earlier said, this can't be entirely avoided, so it's good to tune the "login limiting parameters" as suitable for your use case as possible.  

If the login attempt is not rejected proceed with the login.

If the credentials are correct, log the user in. If authentication fails, insert a new row into the log database.
 
Inserting a new row could go something like this (in PHP):

{% highlight php %}
<?php
$username = $_POST['username'];
$remote_ip = inet_pton($_SERVER['REMOTE_ADDR']); // inet_pton can handle both IPv4 and IPv6 addresses, treat IPv6 addresses as /64 or /56 blocks.
$remote_ip_block = long2ip(ip2long($_SERVER['_REMOTE_ADDR']) & 0xFFFFFF00); // Something like this to turn the last octet of IPv4 address into a 0.
$query = "INSERT INTO login_log SET username=?, remote_ip=?, remote_ip_block=?, login_attempt_time=NOW()";
{% endhighlight %}

**In addition** to setting a "hard limit" for the current client, it is probably a good idea to add CAPTCHA and/or require 2-Factor Authentication after a certain threshold (server-side "hard limits" and client-side challenge-response tests are not mutually exclusive).

Besides CAPTCHA and 2FA, there are also other countermeasures to deal with online brute-force attacks which can be used in conjunction with rate-limiting, for example, see [Device Cookies](https://www.owasp.org/index.php/Slow_Down_Online_Guessing_Attacks_with_Device_Cookies).

### About the relational database

Regarding the above database, it may be good to delete older records periodically to make sure the log database doesn't grow too big (and waste space and resources).

Also, if you consider in-memory databases, like [Redis](http://redis.io/), to hold the logging information, pay attention to the "persistence problem" where older records are erased and how to query IP ranges. (Although needing to hold the records for 10 seconds may not be a problem).

## How much does this help us?

The above rate-limiting methods sets upper bounds to different kind of attacks.

The most "basic attack" (coming from just one address) is limited to 25 attempts per 10 seconds.

Attacks coming from multiple hosts are limited to 100 attempts per 10 seconds when coming from a single /24 IPv4 block.

Attacks against a single username are limited to span at maximum to 5 different IP blocks per 10 seconds.

And finally, there is 300 attempts global limit (per 10 seconds).

## Closing words

The above described method is a self-contained (no external special hardware required) method which can be modified precisely for your situation to detect brute-force attempts, and act against these attacks. However, even aggressive login rate-limiting can not save poor passwords, so make sure no weak passwords enters in the system.

In the other side of the coin, the login related database handling will require resources. As for single login two database queries must be run (SELECT and INSERT). Although the INSERT only happens when the rate-limits are not reached.

After all, this involves once again traditional *security vs usability* trade-offs.

<div>
    <p><span class="label label-primary">11 May 2015</span> <strong><span class="text-danger">This post was revised to address the critical problem with "login tokens", see this <a href="http://timoh6.github.io/2015/05/07/Rate-limiting-web-application-login-attempts.html#comment-2013493916">comment</a> for more information. Sorry for the inconvenience!</span></strong></p>
</div>