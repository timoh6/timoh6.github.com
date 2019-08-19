---
layout: post
title: "Password hashing: Encrypted or keyed hashes?"
---

{{ page.title }}
================

How to properly hash/protect passwords have been a topic for discussion for decades. From this [ancient post](https://seclists.org/bugtraq/1995/Apr/143) on Bugtraq by Steve Bellovin, to modern password hashing competition, and more.

Today it should be pretty much the standard to hash passwords at least somewhat properly. For example, PHP was the first mainstream language to offer developers a friendly and easy to use way to handle password hashing (kudos to [@ircmaxell](https://twitter.com/ircmaxell/)!), without requiring deep understanding on the complex topic. `passwords_hash()` (and related functions) made it easy for everyone.

Needs more pepper?
------------------

Password security is the sum of the amount of [password or key stretching](https://en.wikipedia.org/wiki/Key_stretching) and the quality of the password/passphrase itself. This combination can be perfect if the password is impossible to guess. However, not every password has this special property.

Server-side password security can be increased to some degree obviously by increasing the password hashing work factor settings, but also by making the password hashes "impossible to crack".

This can be done by encrypting or keying the hashes. As long as the adversary won't have this key or "local parameter" or "pepper" (as it have been also called, probably a pun on salts), she won't be able to even start cracking process.

This secret key is stored separately from the hashes, i.e. in a config file. The idea is, if the database of password hashes leaks (SQL injection for example), but the config file holding the key will not be breached, the adversary won't be able to crack the hashes.

The key must be a cryptographic quality key, say, 256-bit CSPRNG output. This kind of key makes the hashes impossible to crack without the key.

Without the key?
----------------

The devil is in the details. There is no doubt such encrypted (or keyed) hashes could be cracked, but the problem is to make the secret key stay secret.

First thing to do is make sure the secret key is not in the same place where the hashes are. Application's source file vs. database is the obious start. This buys a small amount of defence-in-depth.

More could be achieved if the key was unreadable by the application. This would be done using a separate machine or virtual machine instance which is queried by the application server.

The separate machine, say, encrypts password hashes and returns only the output to the application server (when verifying passwords, it decrypts the payload and returns the hash, which is then verified by the application server).

This buys some more security margin, as this setup can tolerate leaking the database and also leaking the application server's source code (adversary has the encrypted hashes, but not the key to decrypt them).

Keying or encrypting the hashes
-------------------------------

There are basically four ways how the secret key could be added to the hashes.

1. **Encrypt the password hash output** (Allows easy key updates and allows password hash work factor updates, easy to integrate into existing systems).

2. **MAC the password hash output** (Key updates require more work, doesn't allow password hash work factor updates without user interaction, easy to integrate into existing systems).

3. **Encrypt the password, then password hash the keyed output** (Doesn't allow key updates without user interaction, allows password hash work factor updates, can't be integrated into existing system without user interaction).

4. **MAC the password, then password hash the keyed output** (Doesn't allow key updates without user interaction, doesn't allow password hash work factor updates without user interaction, can't be integrated into existing system without user interaction).

However, a common? and simple way is to just append or prepend the key to the password and feed the concatenation result to the hashing function.

This is a "broken way" of doing `MAC the password, then password hash the keyed output`. This poses a real problem at least with bcrypt algorithm. Bcrypt doesn't handle longer strings than 72 bytes, any extra bytes are ignored. This could be a problem at least if the key was prepended to the password, and possibly weakening the key if it was appended.

Correct way of keying can be done using a proper MAC algorithm, like HMAC:

{% highlight php %}
<?php
$keyed_password = hash_hmac('sha256', $password, $secret_key);
$hashed_password = password_hash($keyed_password, PASSWORD_DEFAULT, $options);
?>
{% endhighlight %}

This is a better approach, but the key is now mixed with the password and this has an effect to make it impossible to update the key without user interaction (user needs to enter their password before a new hash can be generated). Same applies for keying existing non-keyed hashes, user entering the password is needed before it can be achieved.

If the **password hash output** was encrypted (or keyed), the secret key could be updated without user's interaction. So in this regard it is better to operate on the password hash output. But is there any difference if the hash output was encrypted or MACed?

One difference is maintenance requirements. Keying the hash outputs requires to use and store "Key versions" (along the hashes, which needs to be taken into account in the password handling code) if the key needs to be updated or different databases which have different keys needs to be merged.

This extra work is not needed if the password hash outputs were encrypted. Encrypted hashes can be decrypted and encrypted again with a new key, and the old key can be then discarded instantly.

Encrypting the hashes also hides salts and other hash parameters in the database.

And when operating on the password hash output and doing it by encryption, the underlying password hashing function's work factor settings can be increased without user's password, **if** the password hashing algorithm supports such feature (Argon2 and bcrypt doesn't support it, but for example [yescrypt](https://www.openwall.com/yescrypt/) does).

Conclusion
----------

Gaining a small security margin increase could be achieved by encrypting the hash outputs while keeping the secret key separate from the hashes in the application's source code.

Greater gain is gained if the secret key is kept at least on a separate server instance from the application server (and from database server) and it performs the encryption/decryption process and does not expose the secret key to the application server.

A note about modern password hashing functions (like Argon2) which have "additional secret" parameter. Secret key could be naturally input into Argon2 as an extra parameter and that would make manual keying unnecessary. However, to take full advantage of it, the password handling code would now need to be in the "separate instance" (separate from the app server and database, as the key can't be otherwise set to the Argon2 function). This takes more work to implement on an existing systems and it won't either allow updating the secret key without user interaction.

**If the additional security margin is needed, my recommendation is to encrypt the password hash outputs.**

After all it is a trade-off between simplicity/resources and additional security margin.


