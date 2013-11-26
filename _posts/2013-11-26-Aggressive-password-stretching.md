---
layout: post
title: "Aggressive password stretching - A solution to the low-entropy keys problem?"
---

{{ page.title }}
================

We have probably known for [years](http://codahale.com/how-to-safely-store-a-password/) that user's password should be properly cooked prior to saving to a user database. Actually, we have (or at least we should have) known this for decades.

In late 1970s, [Unix 7th Edition DES-based crypt(3)](http://www.openwall.com/presentations/Passwords12-The-Future-Of-Hashing/mgp00006.html) hash function used 25 iterations (25 DES encryptions) and a 12-bit salt.

[Steven M. Bellovin](http://en.wikipedia.org/wiki/Steven_M._Bellovin) explained password hashing back in April 1995 [as follows](http://seclists.org/bugtraq/1995/Apr/143):

> ...I'd use iterated, salted, locally-parameterized SHA or MD5 (the differences in cryptographic strength between them are not significant for these purposes, a statement I'll be glad to explain privately if anyone asks)...

Fast-forward to 2013, we utilize algorithms like [bcrypt](http://en.wikipedia.org/wiki/Bcrypt), [PBKDF2](http://en.wikipedia.org/wiki/PBKDF2) and [scrypt](http://en.wikipedia.org/wiki/Scrypt) to "cook" the passwords. We do this because human generated passwords or passphrases tends to be weak. Hence the term "low-entropy key". 

Practically speaking, "weak" means a user generated password will not contain enough [guessing entropy](http://www.lysator.liu.se/~jc/mthesis/4_Entropy.html#SECTION00430000000000000000) to resist an adversary who managed to gain the user database dump, and who is able to run efficient offline attack against leaked hashes. Here comes in the need to make adversary's job harder, which is achieved by using the above-named algorithms.

In this post I don't go into specific details and best practices about all aspects regarding password hashing, but I mainly concentrate on the _stretching_ (or key strengthening) part of password hashing in more detail.

Password stretching
-------------------

What happens when passwords are "iterated" thousands of times or even hundred of thousands times (depending on the algorithm)? What happens is we are slowing down the adversary, which practically means we are in fact increasing entropy in the password.

Without password stretching - if the adversary has to do one unit of work to test for a candidate password - and with stretched password she has to do 1024 units of work to test for a candidate password, we actually increased the entropy in a password by 10 bits, which roughly corresponds to one additional word in the password. It is clear that this is significant. The user whose password is being attacked can benefit from "one random extra word" in his password while he doesn't have to memorize that additional "word" at all.

For example, if you pick a passphrase containing two _random_ words from a word list which contains 4096 words, you'll have a passphrase which has 24 bits of entropy (12 bits per word). The adversary has to do [approximately](http://en.wikipedia.org/wiki/Brute-force_attack) 2^23 guesses to discover the password (assuming she knows how the password was constructed).

If "one guess" corresponds a bcrypt call with 05 as the cost parameter (2^5 rounds of stretching), an adversary who can perform 50 000 guesses of bcrypt with 05 as the cost per second will have to spend about 168 seconds cracking the password. If the cost parameter was 10 (2^10 rounds of stretching), the adversary has to spend about 90 minutes cracking the same password.

In the previous example we added 5 bits of entropy to the password by increasing the bcrypt work factor from 2^5 to 2^10. But as the calculations show, this is probably not enough to save the password, as long as the adversary is willing to spend at least about 90 minutes of her time cracking the password.

Just stretch more?
------------------

If we added 10 bits of entropy to the password by increasing the bcrypt cost parameter from 05 to 15 (2^5 to 2^10 increase in work factor), the adversary has to spend about 48 hours cracking the password. This is now probably enough to stop the most impatient attacks, but it is still no way near "even moderate safe" state. 

At the same time we are making the password more secure, we are making trouble for our own system. Especially in the case of interactive web application logins. Now our authentication (and sign and so on) process has to perform bcrypt with 15 as the cost parameter every time a password hash has to be calculated.

To take an example, PHP 5.5.3 on (otherwise idle) i5-2500K@4.0 GHz system spends about 1.8 seconds to run bcrypt hashing using 15 as the cost parameter. This could be a problem for an impatient user waiting for the login to happen, but more so for the server itself. This is because the "login process" exposes the server for a lot easier [DoS attack](http://en.wikipedia.org/wiki/Denial-of-service_attack).

10 parallel login attempts slows the server already to the point it takes around 9 seconds to handle another login request. And this is otherwise idle system. No legitimate clients or anything else consuming server resources.

It is also a good to note that defending against attacks that exploits heavy login operation is difficult. You can't cache logins and you can't probably temporarily disable login functionality either (like for example, you could disable search functionality to mitigate a DoS attack which targets heavy search operation).

You can mitigate the attack by limiting request rate from a single IP (this is also in important role mitigating online password guessing) and maybe even utilize something like [Proof-of-work system](http://en.wikipedia.org/wiki/Proof-of-work_system) etc. But the problem itself still exists after all.

If the malicious user needs to perform 10 parallel requests once in 9 seconds to keep the server in sort of overloaded condition, she doesn't have to do much. Using proxies or a botnet she can utilize DoS attacks easily from different IP addresses while not really even making the "zombie PCs" try hard (just sending a single log in request once in 9 seconds).

The more aggressive stretching (and the more aggressive algorithm) you utilize, the easier it is for the bad guy to take the server on its knees. This is a classic "security vs. usability" trade-off.

How much time can I spend hashing passwords?
--------------------------------------------

The common recommendation is "*as long as you can*". While this is quite broad and even obscure answer, I'll claim it is better suited (as-is) for situations involving off-line password hashing (or key-derivation). One way to express this:

> It is a matter of finding a sweet spot between you and attacker's patience and the security gain needed by your password regarding the value of underlying data.

A sensible, or even paranoid as some would say, default could be ≤ 5 seconds, as it was mentioned in Colin Percival's [scrypt: A new key derivation function - Doing our best to thwart TLAs armed with ASICs](https://www.tarsnap.com/scrypt/scrypt-slides.pdf) presentation at BSDCan'09.

With web servers facing public Internet the earlier paragraphs about denial-of-service attack should be acknowledged. Also, the server load and average honest login attempts affects how much you can tune the cost parameter(s) higher. You have to benchmark to find the correct settings for the specific server and situation. 

A traditional recommendation is to adjust the time needed for the hashing to take ≤ 100 ms. Using the same i5 machine and PHP setup, this corresponds bcrypt with 10 as the cost parameter (~60 ms).

If you can afford only a few milliseconds, you can still benefit from password stretching **a lot** (compared to raw non-stretched, say, SHA256 hashing).

Still using the same i5 machine, bcrypt with 05 as the cost parameter takes ~5 ms. If we used raw SHA256 hashing, an adversary could perform (easily and quite cheaply, just using a gaming computer) at least [1247M calculations per second](http://hashcat.net/oclhashcat-plus/#performance), which is astronomically more than, say, 200 000 calculations per second of bcrypt (with 05 as the cost parameter) which, _if_, she could perform against bcrypt hashes. This means if the adversary could crack the SHA256 hashed password in one minute, she would need around 43 days to crack the same bcrypt cooked password.

In the earlier example, 10 parallel login attempts slowed down the server to handle a request around 9 seconds (bcrypt with 15 as the cost parameter). If we used 10 as the cost parameter, the server spends ~290 ms to handle a request when 10 parallel requests are made. If the cost parameter was 05, the server spends ~16 ms to handle a request (when 10 parallel request are made).

Work factor defaults among common web frameworks
------------------------------------------------

* [Django 1.6](https://docs.djangoproject.com/en/dev/topics/auth/passwords/) defaults to `PBKDF2` using 12 000 iterations. `Bcrypt` can be optionally used and it defaults to 12 as the cost parameter. It is interesting to note why there is such a big gap between `PBKDF2` work factor and `bcrypt` work factor.
* Ruby on Rails 4.0 [SecurePassword](http://api.rubyonrails.org/classes/ActiveModel/SecurePassword/ClassMethods.html) module defaults to `bcrypt` using 10 as the cost parameter.
* [Zend Framework 2.2](http://framework.zend.com/manual/2.2/en/modules/zend.crypt.password.html) defaults to `bcrypt` using 14 as the cost parameter.
* Symfony 2.3 [SecurityBundle](http://symfony.com/doc/current/reference/configuration/security.html#using-the-bcrypt-password-encoder) has an option to use `bcrypt`, defaulting to 13 as the cost parameter. 
* PHP 5.5 native [password_hash()](http://php.net/password_hash) function defaults to `bcrypt` using 10 as the cost parameter.

Concentrating on interactive logins, it seems Zend Framework and Symfony2 SecurityBundle are using quite high work factors, especially Zend's 14 seems too high to be a default value. Django's default work factor for `bcrypt` seems also a bit high (~230 ms on the i5 machine).

PHP's `password_hash()` function and Ruby on Rails SecurePassword module defaults to sensible work factor (10) for bcrypt.

Of course the choice of work factor depends on the server and situation, but presumably PHP and RoR does the best job by choosing a generic default using bcrypt with 2^10 iterations, in 2013.

However, you have to always benchmark and adjust accordingly the work factor parameters (everybody deploying their app does that, right?).

How to make user's passwords more secure?
-----------------------------------------

Proper password hashing is clearly not enough to make sure the password hashes are not weak. The other half of the job is a good password policy.

No algorithm or setting will save passwords like "password" or "12345" etc. This is why we need to make sure the user's password will initially contain enough entropy itself.

_Password policy_ is a difficult topic and would require its own post, but we can summarize it by a recommendation: _Use a good program to tell if the password is considered to be strong enough. Reject if not._

Anton Dedov's [Testing of Password Policy](http://www.slideshare.net/DefconRussia/anton-dedov-testing-of-password-policy) presentation at [ZeroNights 2013](http://2013.zeronights.org/) conference takes a look at different password policy enforcement tools and ends up concluding "_[Passwdqc](http://www.openwall.com/passwdqc/) and [zxcvbn](https://github.com/lowe/zxcvbn) look the best_".

There's also an article [_How to manage a PHP application's users and passwords_](http://www.openwall.com/articles/PHP-Users-Passwords) by [Solar Designer](https://twitter.com/solardiz), where he explains (among many other relevant things) the usage of [passwdqc](http://www.openwall.com/passwdqc/) program in PHP application to enforce a password policy. This is a _good_ read, and not only for PHP developers.
 
Conclusion
----------

Aggressive or hefty password stretching is not a substitute for strong passwords. However, proper password hashing is very important part of password security. Combine the both:

1. Use an appropriate algorithm with proper settings to squeeze more security out of a limited-entropy password. Scrypt and bcrypt being good choices. Tune the work factor for your environment and situation. For interactive logins, ≤ 100 ms being a good starting point.

2. Enforce a password policy. A good program to accept/reject passwords, like [passwdqc](http://www.openwall.com/passwdqc/), has a low percentage accepting weak passwords and rejecting strong enough passwords.