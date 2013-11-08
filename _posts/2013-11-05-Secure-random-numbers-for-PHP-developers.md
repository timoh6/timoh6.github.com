---
layout: post
title: "Secure random numbers for PHP developers"
---

{{ page.title }}
================

How would you gather cryptographically secure random bytes in your PHP application? This is actually quite a good question.

It used to be, and seems, it still is not that uncommon to just simply call `mt_rand()` function to get the job done creating user's "initial password", for example. A bit more experienced reader will notice there is a security bug. For a good demonstration about a real world attack scenario related to insufficient entropy, see [Attacking PHP’s Random Number Generators](http://phpsecurity.readthedocs.org/en/latest/Insufficient-Entropy-For-Random-Values.html#attacking-php-s-random-number-generators).

As we know, PHP has several functions to get "random" values (raw bytes and integers). We have `mcrypt_create_iv()`, `/dev/(u)random`, `openssl_random_pseudo_bytes()` and the rest, which we leave outside of this post.

But actually I'd like to recommended only a few of them for security sensitive purposes. And now I'm not talking about `openssl_random_pseudo_bytes()`.

Randomness from OpenSSL?
------------------------

OpenSSL has a [horrible track record for security](http://www.daemonology.net/blog/2009-06-11-cryptographic-right-answers.html). But to keep the focus specifically on the `openssl_random_pseudo_bytes()` function which is used to get random bytes from OpenSSL in PHP, (I believe) not a single security specialist is happy with the code behind it. It is complicated and probably because of that very reason, has had [flaws](http://mjos.fi/doc/secadv_prng.txt) earlier.

You may also recall [this quite a strange issue](http://emboss.github.io/blog/2013/08/21/openssl-prng-is-not-really-fork-safe/) what happened with Android and Ruby’s SecureRandom implementation, which both rely on OpenSSL.

Could this happen with `openssl_random_pseudo_bytes()` in your PHP application? How about if something else happens to pour from <https://github.com/openssl/openssl/blob/master/crypto/rand/md_rand.c> ? It does not look that good anymore does it?

If your app uses `openssl_random_pseudo_bytes()` for anything related to security (whatever this means... like initializing vectors, remember me tokens, initial passwords etc.), I'm not saying you are doing it wrong. But I'd like to remind about these "issues" which, in my opinion, would be good to acknowledge.

Cooking for better randomness?
------------------------------

It is a common approach to mix data from different randomness sources in userland PHP code and that way breed "better random numbers". Honestly, of course this could work if done carefully. But the problem is, this approach is trying to solve a problem we do not even have in the first place. Any extra code and logic leaves more room for bugs and thus increases the attack surface. For nothing.

It is also a problem because now the bug may be in two distinct places: in your personal implementation or in the OS random number generator. Your application may not benefit at all from the security audits done on the OS random number generator.

/dev/random vs. /dev/urandom?
-----------------------------

Unfortunately Linux comes with two interfaces for random numbers. I say unfortunately, because the choice between them feeds confusion. According to the experts and making long story short, both of them are secure (in any practical purpose), but the blocking nature of `/dev/random` makes it usually unusable in interactive web application usage scenario.

For more about `/dev/urandom` see this [answer by Thomas Pornin](http://security.stackexchange.com/a/3939)

<div>
    <blockquote>
        <p>Or, to say it in less words: use /dev/urandom and be happy; use /dev/random and be sorry.</p>
    </blockquote>
</div>

Also, [@tqbf](https://twitter.com/tqbf) put it concise: <https://news.ycombinator.com/item?id=6216101>

<div>
    <blockquote>
        <p>Secure programs should rely on /dev/urandom, to the exclusion of other CSPRNGs, and should specifically eschew userland CSPRNG engines even when they're seeded from /dev/urandom.
    </blockquote>
</div>

Trust the experts
-----------------

Especially in the field of cryptography, it is better to trust the experts. If you look at the [NaCl](http://nacl.cr.yp.to/) [source code](http://hyperelliptic.org/nacl/nacl-20110221.tar.bz2), you see there is nothing magical going on under the hood. What NaCl does is plain simple `/dev/urandom` read (with proper error checking).


Special need for random integers
------------------------------------

If you happen to need a random integer, say, in the range from 1 to 10. We have a problem in the PHP. That is because we have only `mt_rand()` and `rand()`, but both of them are not cryptographically secure.

This kind of function needs some care to do right on arbitrary ranges. First, you need bytes from `/dev/urandom`. But you need also some specialization to make those bytes a random integer in the specified range and maintain uniform distribution.

If you choose a 32-bit integer (read 4 bytes from `urandom`) and take it modulo n (n is the number of elements in a set you are choosing from), you end up having (a small) bias for sets that are not in size of power of two. That is why, for example, it is not an accident that the Openwall passphrase generator [pwqgen](http://www.openwall.com/passwdqc/) happens to have exactly 4096 words to choose from.

Random Compat library
---------------------

There is a [Random Compat library](https://github.com/ircmaxell/random_compat) for PHP applications to help with random bytes and integers. For example to choose a random integer between 0 and 1000 (inclusive).

{% highlight php %}
<?php
// We construct a "non secure" Random object.
// It uses /dev/urandom and is therefore actually secure
// (as long as your system supports at least either /dev/urandom or mcrypt extension or OpenSSL extension).
require 'random.php';
$random_compat = new PHP\Random();
$int = $random_compat->int(1000);
{% endhighlight %}

I'm personally not happy with all the design details in the library, but it is probably your best bet for now. Therefore I recommend it. 

In the Random Compat library, [I'd prefer](https://github.com/ircmaxell/random_compat/issues/2) to have just one "source" for randomness (which is `/dev/urandom`). This way the implementation gets simpler, and cleaner to use for the end user. Also the library now needs you to be aware that your system supports at least one strong randomness source. Otherwise it will fall back to `mt_rand()` based generation. To avoid the silent fallback, you'd need to construct the object using secure parameter, which will use `/dev/random` and is therefore susceptible to block.

Time will tell if my approach will be preferred. But the sure thing is, PHP needs this kind of library in the core.

Conclusion
----------

As said in the previous paragraph, your best bet is probably to use [Random Compat library](https://github.com/ircmaxell/random_compat).

If you prefer simpler approach and you only need raw bytes, you can gather the bytes using `/dev/urandom` or the Windows equivalent CryptGenRandom. This is done using `mcrypt_create_iv($bytes, MCRYPT_DEV_URANDOM)` function call. Pay attention you use `MCRYPT_DEV_URANDOM` (and pay attention you are on PHP 5.3+).

You can also read straight from the `/dev/urandom` using `fopen` et al. if you are on Unix-like host.

<div>
    <span class="label label-primary">08 Nov 2013</span> <span class="text-info">Post revisited to add some additional detail and polish. View changes at [GitHub](https://github.com/timoh6/timoh6.github.com/commits/master/_posts/2013-11-05-Secure-random-numbers-for-PHP-developers.md).</span>
</div>






