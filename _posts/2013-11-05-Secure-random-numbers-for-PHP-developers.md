---
layout: post
title: "Secure random numbers for PHP developers"
---

{{ page.title }}
================

How would you gather cryptographically secure random bytes in your PHP application? This is actually quite a good question.

It used to be, and seems, it still is not that uncommon to just simply call `mt_rand()` function to get the job done creating user's "initial password", for example. A bit more experienced reader will notice there is a security bug.

As we know, PHP has several functions to get "random" values (raw bytes and integers). We have `mcrypt_create_iv()`, `/dev/(u)random`, `openssl_random_pseudo_bytes()` and the rest, which we leave outside of this post.

But actually only a few can be recommended for security sensitive purposes. And now I'm not talking about `openssl_random_pseudo_bytes()`.

What is wrong with openssl_random_pseudo_bytes()?
-------------------------------------------------

If your app uses `openssl_random_pseudo_bytes()` for anything related to security (whatever this means... like initializing vectors, remember me tokens, initial passwords etc.), I'm not saying you are doing it wrong. But I'd like to remind about a few issues which would be good to acknowledge.

OpenSSL has a [horrible track record for security](http://www.daemonology.net/blog/2009-06-11-cryptographic-right-answers.html). But to keep the focus specifically on the `openssl_random_pseudo_bytes()` function, (I believe) not a single security specialist is happy with the code behind it. It is complicated and probably because of that very reason, has had flaws earlier.

You may also recall [this quite a strange issue](http://emboss.github.io/blog/2013/08/21/openssl-prng-is-not-really-fork-safe/) what happened with Android and Ruby’s SecureRandom implementation, which both rely on OpenSSL.

Could this happen with `openssl_random_pseudo_bytes()` in your PHP application? How about if something else happens to pour from <https://github.com/openssl/openssl/blob/master/crypto/rand/md_rand.c> ? It does not look that good anymore does it?

Anything else?
--------------

It is also a common approach to mix data from different randomness sources in userland PHP code and that way breed "better random numbers". Honestly, of course this could work if done carefully. But the problem is, this approach is trying to solve a problem we do not even have in the first place. Any extra code and logic leaves more room for bugs and thus increases the attack surface. For nothing.

It is also a problem because now the bug may be in two distinct places: in your personal implementation or in the OS random number generator. Your application may not benefit at all from the security audits done on the OS random number generator.

/dev/random vs. /dev/urandom?
-----------------------------

Unfortunately Linux comes with two interfaces for random numbers. According to the experts and making long story short, both of them are secure (in any practical purpose), but the blocking nature of `/dev/random` makes it usually unusable in interactive web application usage scenario.

For more about `/dev/urandom` see this [answer by Thomas Pornin](http://security.stackexchange.com/a/3939) Also, [@tqbf](https://twitter.com/tqbf) put it concise: <https://news.ycombinator.com/item?id=6216101>

Trust the experts
-----------------

Especially in the field of cryptography, it is better to trust the experts. If you look at the [NaCl](http://nacl.cr.yp.to/) [source code](http://hyperelliptic.org/nacl/nacl-20110221.tar.bz2), you see there is nothing magical going on under the hood. What NaCl does is plain simple `/dev/urandom` read (with proper error checking).


Special need for random integers
------------------------------------

If you happen to need a random integer, say, in the range from 1 to 10. We have a problem in the PHP. That is because we have only `mt_rand()` and `rand()`, but both of them are not cryptographically secure.

This kind of function needs some care to do right. First, you need bytes from `/dev/urandom`. But you need also some specialization to make those bytes a random integer in the specified range and maintain uniform distribution. For example, it is not an accident that the Openwall passphrase generator [pwqgen](http://www.openwall.com/passwdqc/) happens to have exactly 4096 words to choose from.

There is a [Random Compat library](https://github.com/ircmaxell/random_compat) for PHP applications to help with random bytes and integers. I'm personally not happy with all the design details in the library, but it is probably your best bet for now. Therefore I recommend it.

In the Random Compat library, [I'd prefer](https://github.com/ircmaxell/random_compat/issues/2) to have just one "source" for randomness (which is `/dev/urandom`). This way the implementation gets simpler, and cleaner to use for the end user.

Time will tell if my approach will be preferred. But the sure thing is, PHP needs this kind of library in the core.






