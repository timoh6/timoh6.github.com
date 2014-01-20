---
layout: post
title: "Cryptography in web applications: a false sense of security?"
---

h1. {{ page.title }}

Does your framework of choice offer an easy way to perform data encryption? Maybe you have even utilized data encryption in some format. Something like:

{% highlight php %}
<?php
$secret = Crypter::encrypt('Secret data');
{% endhighlight %}

It could not be much easier than that. It is hard to argue. But things won't stay as simple as this if you look at the meaning of "secure data encryption" a little bit closer.

Usually people encrypt their data to make sure the data will stay safe. What does this actually mean? Simply put, it means your data stays secret as long as the secret key stays secret. No matter if an active attack is going on and the adversary can read your encrypted data.

But does people expect to achieve something more when they use encryption? Probably yes. Often people think they secure their application if they magically use encryption. Now we get to the point.

Encryption itself is most of the time useless as is. Encrypted data is malleable, which means the adversary can change the contents of your plaintext by modifying the ciphertext. This is something a secure system should not let happen under any circumstances.

If we look at block ciphers like AES for example, it is often forgotten that plain block ciphers won't help you that far. This is because they encrypt only fixed-size blocks. If your plaintext is not exactly one block long, you have to dig a bit deeper and make your block cipher work in certain "mode". It is also forgotten because it is easy to forget. The underlying encryption library (like MCrypt) forces you to use some mode, or maybe it hiddenly defaults to `ECB`. It doesn't care which mode, as long as you pass in a mode it can handle. All is good and you can encrypt arbitary length messages. Same goes with padding, it is done automatically. However, automatic padding itself probably won't have such a security meaning as automatic encryption mode.

History has shown that letting people choose arguments like encryption mode leads usually to no good. How would an average software developer know which "encryption mode" should be used?

To get back to the ciphertext malleability, we could counter the issue by using an appropriate encryption mode. But quite often you have to do authentication by hand, because the underlying encryption library does not support authenticated encryption modes. Which means you need to use some sort of MAC. We are again in a situation where you have to choose something. This time it is which MAC to use.

You could end up using HMAC. But yet again you have to choose do you first encrypt the plaintext and then calculate the MAC from the resulted ciphertext, or do you first calculate the MAC code for the plaintext and then encrypt the MAC code with the plaintext and after decrypting you check if the MAC code is correct. Et cetera.

It is also good to keep the bigger picture in mind. I mentioned about authenticating ciphertext or plaintext using a MAC code. Lets go with a route where we authenticate the ciphertext. It is so called "Encrypt-Then-MAC" composition. But if you look more closely you will notice changes are that the plaintext could be modified if our adversary can mangle with the initialization vector. To put it simple, you have to also know you need to include all the related pieces of data under your MAC. Not just the ciphertext.

We are not done with our "authentication" just yet. If you check whether the supplied MAC code is exactly equal with the data received and MACed, you are probably leaking information to our adversary. This information could entirely destroy your MAC routine. The sweet spot here is == string comparison. To make it simple, it takes a tiny bit longer time to compare strings "1234A" and "1234B" than what it takes to compare strings "A2345" and "B2345". Our adversary can probably measure those differences and use it against our system.

We are not yet done much with our demonstration, but as you can see, there are already quite a few nuances which could ruin the whole effort. This practically explains a bit of this well known saying: "A security system is only as strong as its weakest link". 

To get back to block ciphers and modes, it is worth to mention there are some mathematical facts you should be aware of. If we play safe and use AES in CBC mode, you should not encrypt more than about 2^32 blocks using a single key (no matter how many different messages). This is to keep the probability of a collision (and information leakage) low enough. 2^32 blocks may sound a lot, but after all, we are dealing with a secure system. It is better not to leave any room for uncertainty.

Random or not so random?
------------------------

We have talked about CBC mode encryption and you might recall that CBC mode requires an initialization vector. Harder question is how would you generate such an initialization vector. Your encryption and authentication keys should be also random bit strings. At least we can safely make an initial assumption that encryption/authentication keys should not be user typed configuration parameters. We do not go into details of key derivation here.

Using quality random numbers is the answer. More precise answer is to let the underlying operating system generate those bit strings for you. Using PHP, you can end up generating random numbers using for example:

{% highlight php %}
<?php
mt_rand();
rand();
mcrypt_create_iv();
uniqid();
openssl_random_pseudo_bytes(); // etc.
{% endhighlight %}

Now you should pick the appropriate methods to generate the random data. This is again one cornerstone where you could go wrong. If you are really paranoid, you read the bytes from `/dev/random`. At least on Linux systems, your web application suddenly became horribly slow. Something went wrong.

Encryption keys
---------------

Assume we already have a quality random string which can be used as an encryption key. If you look a bit closer, you'll notice you probably should change those keys some day. It is not a problem per se, but imagine how you end up hacking your software to be able to handle any data which was encrypted using the old key.

Fortunately good crypto systems already takes care of key rotation. So you do not have to hack your core application just for the sake of key rotation. 

Implementation errors
---------------------

Lets take a quick look at the lower level code details. People often want to encrypt using AES-256. They write something like:

{% highlight php %}
<?php
mcrypt_encrypt(MCRYPT_RIJNDAEL_256, $key, $value, $mode, $iv);
{% endhighlight %}

What could go wrong? If you have tested your encryption routines against some known "AES test vectors", you probably came into conclusion that something is wrong here. There is a mismatch between your encryption output and those test vectors. It is not about $key or $value or $iv, but the reason is you did not perform AES-256 encryption at all. Instead, you encrypted the data with 256-bit Rijndael cipher, which is not AES. It is not a well studied algorithm and not a standard. You may not want to build your encryption routines on the shoulders of such an algorithm.

Another common problem is "error tolerance". Say, your application tries to generate random bytes (IV, for example), but there is no strong randomness sources available in your system. Now if the application does not care about this minor detail, and continue to fall back to something like rand()/microtime() based custom implementation... It is going wrong. There is no excuse to use weak random data (when strong random data is required) and you should instead exit immediately.

Many systems gets the encryption keys from a configuration file. While this itself could be a warning sign, it gets worse when the key gets modified like:

{% highlight php %}
<?php
$key = md5(Config::get('encryption_key'));
{% endhighlight %}

The main problem here is not `md5()`, but the hex-output. The entropy is efficiently truncated because the whole "character space" will not be used. It is also important to note that encryption algorithms are sensitive about keys. However, this is usually hidden behind the front door. MCrypt for example will happily accept keys as long as they are no longer than the maximum key size. If the key is too short, it is automatically padded. Zero length keys are fine.

We have covered some of the nuances about encryption systems. It should be clear now that you just can't magically use `mcrypt_encrypt()` and make the system secure (just because it uses encryption).

I mentioned earlier about frameworks and how they offer encryption helpers. The question is does your framework do it correctly? Take a quick look at your encryption library and check how it implements its encryption routines. You could start by checking first these things I mentioned in this post.

Can you trust your data will be safe if you first just simply encrypt it using your framework (or any other piece of software of your choice)? Can those encryption routines provided by your framework operate correctly in your environment?

These questions are hard to answer. But we should take a brief example about thread models first.

Lets assume our framework is doing all the encryption related bits and pieces good. You want to encrypt the files that hold your users secret information. Those files are saved to `/path/to/mysite/tmp/` folder. Your application runs on `/path/to/mysite/www/` folder.

What could happen if your server gets compromised? Are you storing the encryption keys in your `mysite` folder or so? If yes, the attacker can now possibly read not only your (encrypted) files, but also your encryption keys. It is easy to see that encrypting those files didn't help you at all. Maybe it was just some false sense of security, or maybe it looked good on paper?

Encryption and related data security is such a broad and complicated topic that you maybe should not do it on your own. Even if all the encryption tools does their job properly, you still can not be sure did you cover all the doors and windows. Since the adversary does not need to play by any rules there is no way to know what to expect.

It is surprisingly to see, as previous mentioned, that no matter how hard people test their applications, errors like using non standard encryption algorithms just accidently slips in. And this should have been an easy test case. But how could you test against the unknown? The adversary most probably does not give you the test vectors about hes next attack.

What can you do then?
---------------------

You should use well known and vetted high-level libraries to perform encryption operations. If the library is asking you to choose "mode" or "cipher" or "iv" etc. You have to probably change the library.

Hire professional security experts to pinpoint flaws in your code. Make sure good guys finds the holes and design flaws before bad guys does. 

Cryptographers talk about "professional paranoia". It should not be only just cryptographers who think this way. Every developer should get familiar with this special mindset.

Educate yourself. It takes some specialisation just to even moderately safely build your system on top of existing encryption libraries. It is a whole different story if you start building your own encryption library. The path is relatively long from `mcrypt_encrypt()` to complete encryption system.

Footnote
--------

This post is based on what I have seen on the PHP community. There are big players and smaller players who utilize data encryption in their frameworks, but hardly anybody does it carefully. It seems to be often more like a deep wish rather than solid engineering and expertise behind how the encryption routines are build and brought to the masses.