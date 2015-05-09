---
layout: post
title: "Rate-limiting web application login attempts"
---

{{ page.title }}
================

<div>
    <span class="label label-primary">09 May 2013</span> <span class="text-info">NOTE the login token method described in this post is not effective against parallel attacks (see comments). **This post will be revised in the upcoming day to address that**s.</span>
</div>

How can I "throttle logins" or "how can I rate-limit login attempts" is a common question raised from time to time among web application developers.

In this post I describe one possible way to implement a *self-contained* (server-side) and secure rate-limiting mechanism for web applications (browser-server interaction).

## Why should we rate-limit login attempts?

In an ideal situation, rate-limiting login attempts would be a waste of time and resources. In the ideal situation, all credential holders of your system would be using a password/pasphrase (or an equivalent) which is strong enough to make it impossible for anyone to guess a single credential, even if they could fire huge amounts of tries against your login mechanism.

If you used a "password" which has, say, 2^128 worth of [guessing entropy](http://www.lysator.liu.se/~jc/mthesis/4_Entropy.html#SECTION00430000000000000000) strength, no one could throw enough login attempts to guess the right password. The adversary would be only wasting her time.

In reality, the situation is usually far from ideal. Passwords like "Password3" and so on are easy to crack offline, but such passwords, and especially without rate-limiting, are also feasible to crack online.

This is why arguably most online systems employing credentials should make sure they make the adversary's job guessing a correct credential as hard as possible. Which can be read as *as time consuming as possible*.

## Methods to defend against malicious login attempts

At first glance, it may pop up that defending against login brute-forcing is as simple as locking out an account after X failed login attempts (at a given time period) or locking out a remote IP after X failed login attempts (at a given time period). While both of those approaches could work to some extent, they leave quite a bit to be desired.

Locking out the target account will lead to the traditional "deny login DoS" (the actual account owner can't login to the system) and locking out a specific IP address will be a problem for other users behind the same IP address (but it probably won't stop the adversary as she could just continue the attack from another source).

To employ a better defense, let's first define the threat models.

## Threat models

While login attempt related threats could be deeply situation-dependent, we can focus on the general case which means we don't per se lock accounts or source IPs, but we merely focus on making the brute-force attempts take longer. Let's sum the threat models as follows:

* Attacks against a single target from single source
* Attacks against a single target from multiple sources
* Attacks against multiple targets from a single source
* Attacks against multiple targets from multiple sources

It is difficult to act against adversary who tries a few "most common passwords" from many different sources against every account on the system, but we can focus especially on the "multiple source against single account" and "single source" threats. 

If we assume the adversary can mount the login attempts from, say, thousands of unique IP addresses and we do not want to lock the target account (permanently), we must make sure it takes as long as possible to try all the candidate passwords the adversary holds. And we want to do this in such a manner which does not consume endlessly our login server resources (recall rate-limiting with `sleep()` PHP function).

## Login tokens

This can be done using *login tokens*, which means we create an unique and unpredictable token which grants a client *the right to try to log in* at a given time.

The basic idea is as follows:

1. Client enters his username and password and submits the login form.
2. Server checks the credentials (sets login status) and generates a token (say, 128-bit cryptographically strong random number hex-encoded). If the username is not found, return the initial login form.
3. Server updates the "login log" and calculates the needed delay.
4. Server assigns the token, valid after timestamp, user identifier and login status to the client's session.
5. Server returns a form to the client where the token will reside as a hidden field, the markup will contain a message "You can try to log in in a few...". 
6. Client waits the minimum delay and submits the form. If the same form is returned, client waits the second delay and submits the form, and so on.
7. Server checks the token exists in the client's session and verifies current timestamp is greater than the timestamp stored in session. If the token is not found return a fresh login page. If the token is not yet valid, return same form as in point 5.
8. If login status is true, log the client in based on the user id found in the session.
9. If login status is false, a fresh login form (asking for username and password) is returned to the client.

In point **6.** the client will not actually know when the token is valid to submit as the server doesn't tell it. The server could reply with a markup saying "You can try to log in in either after 1 second, 3 seconds, 5 seconds, 10 seconds or 15 seconds".

This is something JavaScript can handle for the user. Say, using Ajax the login attempts can be automated. As long as the client-side code knows the "waiting steps", it can submit the token after every step and check the result while showing a "Login in process" message to the human behind the screen. Note the server should not tell the needed delay to the client as it prevents leaking the login status.

In point **3.** the server needs to calculate appropriate waiting delay. To achieve this, we will store *all* login requests to a database and thus we can query the amount of login attempts for a specific username and the amount of login attempts from a specific source, in a given time period. 

The database structure for the, say, "login_log" table could look like this:

{% highlight sql %}
`username` varchar(100) NOT NULL
`remote_ip` varbinary(16) NOT NULL
`login_attempt_time` datetime NOT NULL
`status` tinyint(3) unsigned NOT NULL DEFAULT '0',
KEY `remote_ip` (`remote_ip`),
KEY `login` (`login`),
KEY `status_time` (`status`,`time`)
{% endhighlight %}
    
Every time a client sends username and password, and if *a valid username* is found insert a new row in the table. Inserting a new row in the table even if the password matches is a pre-emptive action to guard against leaking possible exploitable timing information about the password validity. Note we do not try to prevent information whether an account (based on the username) exists in the system.

Inserting a new row could go something like this (in PHP):

{% highlight php %}
<?php
$username = $_POST['username'];
$remote_ip = inet_pton($_SERVER['REMOTE_ADDR']); // inet_pton can handle both IPv4 and IPv6 addresses, consider addressing IPv6 addresses as /64 blocks.
$status = $passwords_matches // Int 1 or 0 from the initial check (point 2. in the above list)
$query = "INSERT INTO login_log SET username=?, remote_ip=?, login_attempt_time=NOW(), status=?";
{% endhighlight %}

Next query the same database to get login attempt count for the username (from any IP) and number of attempts from the source IP (against any other username except the currently requested username) within the last 6 hours:

{% highlight sql %}
SELECT SUM(CASE WHEN remote_ip = ? AND username <> ? THEN 1 ELSE 0 END) AS ip_attempt_count, SUM(CASE WHEN username = ? THEN 1 ELSE 0 END) AS username_attempt_count
FROM login_log
WHERE
STATUS = 0
AND login_attempt_time > (NOW() - INTERVAL 6 hour) # All failed login attempts within the last 6h
{% endhighlight %}

The above query counts number of failed login attempts (against any account) from the IP address a current login request is coming from as `ip_attempt_count` and number of failed login attempts against the currently requested username (from any IP) as `username_attempt_count`.

This gives us enough information to do basic delay calculations. At first we set *a base delay*, which could be, for example, 1 or 2 seconds. This means even if there are no signs of login brute-forcing (that we could detect), we still delay the login a bit. This will give us a *base guarantee* and the logic based on the amount of failed login attempts can add on top of that. 

It is a tricky part to estimate how much delay should be added after, say, 3 failed attempts, or after 4 failed attempts and so on. It might be also tricky to estimate how old failed attempts we care about. But as a generic basis, we could go about:

* 1 second base delay + (0.2 x ip_attempt_count) seconds + (0.5 x username_attempt_count) seconds.
* Waiting delays rounded to either 1, 3, 5, 10, 15 seconds. The client-side JavaScript code must know these waiting periods.
* Maximum possible delay adjusted to be 15 seconds.

The above list shows we don't care about failed login attempts against any account coming from the current client's IP as much as we care about failed login attempts for the currently requested username (failed login attempts against the specific username has a greater multiplier). This is a *generic default*, but your case may need other kind of logic.

As an example, if there's 10 failed login attempts against the currently requested username *alice* and there's 20 failed login attempts from the IP current request is coming from (excluding attempts against *alice*), the delay we get is:

`1 + (0.5 x 10) + (0.2 x 20)` = **10 seconds**

15 seconds maximum delay can sound a really small delay, at least in case a massive amount of requests are targeting a single credential, but for the sake of usability we probably must sacrifice from the security side. However, displaying a nice animation or some entertainment while the user is waiting could buy the user some extra patience. Remember to adjust for your specific case.

**In addition** to setting a "hard delay" for the current client, it is probably a good idea to add CAPTCHA and/or require 2-Factor Authentication after a certain threshold (server-side "hard delays" and client-side challenge-response tests are not mutually exclusive).

And note, the above example is just an **example**. You could for example find it more suitable if failed login attempts within the last 30 minutes has more weight than attempts made 6 hours ago. Or login attempts from foreign country has more weight than attempts from another county, etc.

It is also important to note that in this post we purposely did not lockout accounts or IP addresses, but this may be different in your situation (at some point). For example, failed login attempts coming from certain geographic sources could be denied (maybe on higher layer). Or if there's just too much attempts against an account, lock the account temporarily.

Regarding the above database, it may be good to delete older records periodically to make sure the log database doesn't grow too big (and waste space and resources).

## How much does this help us?

If we assume the adversary is mounting an attack using 100 unique IP addresses against a single target (alice), and each of her machine sends 1 login request per second (and your system is able to handle that), she ends up being able to try *240 000* candidate passwords in an hour.

With the above logic, the maximum 15 seconds delay for alice's account is reached soon. It means the attack will soon become 15 times slower. I.e. "one day" attack becomes "15 days attack" without bugging the actual account owner more than 15 seconds (in case he enters correct credentials).

## Closing words

The above described method is a self-contained (no external special hardware required) method which can be modified precisely for your situation to detect brute-force attempts, and act against these attacks. However, even aggressive login rate-limiting can not save poor passwords, so make sure no weak passwords enters in the system.

In the other side of the coin, the login related database handling will require resources. As for single login two database queries must be run (INSERT and SELECT) plus an extra amount of "token requests" are needed.

Also, while JavaScript can make the login experience smooth for the end user, but if the end user doesn't have JavaScript enabled the login experience may not be smooth at all.

After all, this involves once again traditional *security vs usability* trade-offs.