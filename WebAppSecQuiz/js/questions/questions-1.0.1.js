questionData = [
    {
        question: 'Input validation should be based on....',
        answers: [
            { id: 0, answer: 'Whitelisting' },
            { id: 1, answer: 'Blacklisting' }
        ],
        currentAnswer: ko.observable(-2),
        correctAnswer: 1
    },
    {
        question: 'Your application sets a cookie with <span class="text-info">Secure</span> attribute. What does this mean?',
        answers: [
            { id: 0, answer: 'The cookie can not be accessed by JavaScript' },
            { id: 1, answer: 'The cookie will not be sent cross-domain' },
            { id: 2, answer: 'Client will send the cookie only over an HTTPS connection' }
        ],
        currentAnswer: ko.observable(-2),
        correctAnswer: 2
    },
    {
        question: 'Which of the following is used to prevent Clickjacking?',
        answers: [
            { id: 0, answer: 'HTTPS Connection' },
            { id: 1, answer: '<span class="text-info">X-Frame-Options</span> HTTP Header' },
            { id: 2, answer: '<span class="text-info">Content-Security-Policy</span> HTTP Header' }
        ],
        currentAnswer: ko.observable(-2),
        correctAnswer: 1
    },
    {
        question: 'Your web page includes advertising JavaScript from a third-party service. Is it safe to assume that problems like XSS, caused by this third-party JavaScript, is not technically possible on your web page?',
        answers: [
            { id: 0, answer: 'Yes, if you validate the JavaScript before you deploy it on your page' },
            { id: 1, answer: 'No' }
        ],
        currentAnswer: ko.observable(-2),
        correctAnswer: 1
    },
    {
        question: 'All SQL queries can be made safe using prepared statements?',
        answers: [
            { id: 0, answer: 'Yes' },
            { id: 1, answer: 'Yes, if both the server and the client supports prepared statements' },
            { id: 2, answer: 'No, dynamically created specifiers like &quot;<span class="text-info">GROUP BY</span> xxx&quot; etc. needs separate validation' }
        ],
        currentAnswer: ko.observable(-2),
        correctAnswer: 2
    },
    {
        question: 'The session ID must be renewed after...',
        answers: [
            { id: 0, answer: 'A client logs in' },
            { id: 1, answer: 'A short idle period (ie. 30 seconds)' },
            { id: 2, answer: 'Any privilege level change' }
        ],
        currentAnswer: ko.observable(-2),
        correctAnswer: 2
    },
    {
        question: 'Your application communicates with a third-party JSON API over the Internet. The API is accessed using an HTTPS connection, which is based on a self-signed certificate. Is the communication between your application and the API secure?',
        answers: [
            { id: 0, answer: 'Yes' },
            { id: 1, answer: 'Yes, if the third-party certificate can be securely imported into your application' },
            { id: 2, answer: 'No, it is not possible with self-signed certificates' }
        ],
        currentAnswer: ko.observable(-2),
        correctAnswer: 1
    },
    {
        question: 'Placing user submitted data into a typical HTML document is always safe (XSS-wise) if you escape HTML specific characters:<br><span class="text-info">&lt;</span>, <span class="text-info">&gt;</span>, <span class="text-info">&amp;</span>, <span class="text-info">&#039;</span>, <span class="text-info">&quot;</span><br>from the user input? Ie. you use <span class="text-info">htmlspecialchars()</span> funtion in PHP (with <span class="text-info">ENT_QUOTES</span>).',
        answers: [
            { id: 0, answer: 'Yes' },
            { id: 1, answer: 'No, context-specific escaping is needed' }
        ],
        currentAnswer: ko.observable(-2),
        correctAnswer: 1
    },
    {
        question: 'Your web server supports secure (HTTPS) connections. By design, which of the following is the best way to make sure a client will not accidentally request a page over non-secure HTTP connection?',
        answers: [
            { id: 0, answer: 'Redirect all requests for port 80 to port 443' },
            { id: 1, answer: 'Completely close port 80' },
            { id: 2, answer: 'Use HTTP <span class="text-info">Strict-Transport-Security</span>' }
        ],
        currentAnswer: ko.observable(-2),
        correctAnswer: 2
    },
    {
        question: 'Your application performs logging queries after certain events. Timestamp, IP address, POST payload and a type of action will be saved to a MySQL database. Is it possible for an adversary to bypass this logging query by sending specifically crafted POST payload?',
        answers: [
            { id: 0, answer: 'Yes, further validation is needed on the input data' },
            { id: 1, answer: 'No, if escaping is used (ie. <span class="text-info">mysql_real_escape_string()</span> function in PHP)' },
            { id: 2, answer: 'No, if the SQL query is performed using a prepared statement with correctly set character encoding' }
        ],
        currentAnswer: ko.observable(-2),
        correctAnswer: 0
    },
    {
        question: 'You concatenate and hash two inputs, <span class="text-info">input1</span> and <span class="text-info">input2</span>, with SHA-256 algorithm. Is it possible that the order of the inputs fed to the SHA-256 function may have a direct effect regarding security of the hashing?<br><span class="text-info">sha256(input1 . input2)</span><br>vs.<br><span class="text-info">sha256(input2 . input1)</span>',
        answers: [
            { id: 0, answer: 'Yes' },
            { id: 1, answer: 'No, security-wise it does not make a difference with SHA-256' }

        ],
        currentAnswer: ko.observable(-2),
        correctAnswer: 0
    },
    {
        question: 'You use a 104-bit, cryptographically strong, random number as your password on a web site which stores passwords as plain MD5 hashes: <span class="text-info">md5(password)</span>. Is it safe to assume your password will be safe if the user database leaks?',
        answers: [
            { id: 0, answer: 'Yes' },
            { id: 1, answer: 'No, because of the lack of salting and stretching' },
            { id: 2, answer: 'No, because of the broken collision resistance of MD5' }
        ],
        currentAnswer: ko.observable(-2),
        correctAnswer: 0
    },
    {
        question: 'You are running Apache + PHP server. PHP runs as an Apache module:<br><span class="text-info">AddHandler php5-script .php</span><br>You allow users to upload avatar images (in PNG format). Avatar filename is allowed to contain characters: &quot;<span class="text-info">a-z0-9.-</span>&quot;.<br>Is it safe to assume you are secure against PHP code execution launched via uploaded files?',
        answers: [
            { id: 0, answer: 'Yes, if I make sure the filename ends with <span class="text-info">.png</span> extension' },
            { id: 1, answer: 'Yes, if I reject files that do not pass <span class="text-info">getimagesize()</span>' },
            { id: 2, answer: 'No, further configuration is needed on the server-side' }
        ],
        currentAnswer: ko.observable(-2),
        correctAnswer: 2
    },
    {
        question: 'Your PHP application reads user submitted XML documents using DOM. You fetch certain element values from the XML:<br><span class="text-info">$doc = new DOMDocument();<br>$doc-&gt;loadXML($xml);<br>$params = $doc-&gt;getElementsByTagName(&#039;parameters&#039;);</span><br>You display some of those parameters on the user&#039;s account settings page. Is it possible to exploit this scenario with a maliciously crafted XML document?',
        answers: [
            { id: 0, answer: 'Yes' },
            { id: 1, answer: 'No, if I make sure the user submitted XML is well-formed' },
            { id: 2, answer: 'No, if I escape the data before displaying on the account page' }
        ],
        currentAnswer: ko.observable(-2),
        correctAnswer: 0
    },
    {
        question: 'You authenticate client-controlled data using an HMAC with a secret key. If the MAC does not match you reject the message. Which of the following can be used to make sure your application will not leak exploitable timing information in the following string comparison:<br><span class="text-info">if (mac_from_client != secret) error()</span>?',
        answers: [
            { id: 0, answer: 'HMAC (using the secret key) both the strings <span class="text-info">mac_from_client</span> and <span class="text-info">secret</span> before comparison' },
            { id: 1, answer: 'Add cryptographically strong random delay to each response' }

        ],
        currentAnswer: ko.observable(-2),
        correctAnswer: 0
    }
];