---
layout: post
title: "GenPhrase Security Bug Bounties"
---

{{ page.title }}
================

<div class="image-holder"><img src="/image/bughunt.jpg" alt="Security Bug Hunt" class="image-responsive"><small>Photo: REUTERS</small></div>

[GenPhrase](https://github.com/timoh6/GenPhrase) is a small PHP library (based on passwdqc's [pwqgen](http://www.openwall.com/passwdqc/) program) used to generate secure and easy to remember passphrases.

Due to the nature of the library, security is an absolute requirement (this is a reason GenPhrase is based on Openwall pwqgen).

To emphasise the security effort put on GenPhrase _and_ to make the software better, I start a small GenPhrase security bug bounty program. I donate **$100** to award people who find security bugs in the GenPhrase library.

The **$100 bounty** is split into smaller categories as follows:

1.  **$50** for bugs which causes the generated passphrases to contain less entropy that was requested, i.e. with default settings (under certain "random byte output") only two words are returned instead of three words, or if one element was being chosen from a set of 20 elements and only 19 different elements could get returned etc. And bugs which allow malicious code execution.
2.  **$30** for bugs which causes the "elements" being chosen on non-uniform fashion.
3.  **$5** for bugs which causes the "elements" being chosen on slightly non-uniform fashion or allows malicious code execution via __unknown__ weaknesses in PHP core functions used by GenPhrase.

<p><span class="label label-info">28 Aug 2014</span> <span class="text-muted">Bounties for category 1 and 2 bugs were raised.</span></p>

Bugs caused by a buggy (or malicious) system random number generator or "bad/invalid" wordlists added outside of the library are not subject to a bounty. Also, side-channels (i.e. in functions used to pick elements etc.) which are not practically exploitable are not subject to a bounty.

The target version of GenPhrase is always the latest tagged release on GitHub:

[https://github.com/timoh6/GenPhrase/tags](https://github.com/timoh6/GenPhrase/tags)

Found a security bug?
---------------------

Send an email to timoh6@gmail.com with description of the bug(s). If it is an applicable find, I'll send the payment to you (or whom you wish) via PayPal. You can send multiple bug reports in a single email, each will be awarded accordingly.

About payments
--------------

*   A bounty will only be awarded to the first person who reports a bug.
*   If the same bug appears in multiple locations, it might be count as a single bug.
*   The payment will be done with PayPal as soon as possible (I cannot give a guarantee, but within 5 working days is a reasonable time frame).
*   The classification of security bugs, values of bounties and conditions under which bounties are paid are subject to change without notice.
*   I will keep the right to determine whether a bug report qualifies for a bounty and for which bounty it qualifies.

If the $100 bounty gets depleted, no more payments will be made until further notice. This page will be kept updated about how much of the bounty is still available.

GenPhrase Security Bug Bounty Recipients
----------------------------------------

1. **March 3. 2017**. Words being chosen on (slight/medium) non-uniform fashion, found by Solar Designer. 20 USD Bitcoin payment was made to <a href="https://archive.org/donate/bitcoin.php">The Internet Archive</a> by the request of Solar Designer.

**The security bug bounty will be active until further notice.**

<p class="text-muted"><small>This security bug bounty page was inspired by <a href="http://www.tarsnap.com/bugbounty.html">Tarsnap Bug Bounties</a>.</small></p>

