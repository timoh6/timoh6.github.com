function QuizViewModel() {
    var self = this;

    self.quizState = ko.observable('start');
    self.currentQuestion = ko.observable(0);
    self.correctAnswersVisible = ko.observable(false);
    self.questions = ko.observableArray(questionData);


    self.startQuiz = function () {
        self.quizState('inGame');
    };

    self.displayQuestion = ko.computed(function () {
        return self.questions()[self.currentQuestion()]['question'];
    });

    self.displayAnswers = ko.computed(function () {
        return self.questions()[self.currentQuestion()]['answers'];
    });

    self.answerIsChecked = function () {
        return self.questions()[self.currentQuestion()].currentAnswer();
    }

    self.questionsCount = function () {
        return self.questions().length;
    }

    self.questionNumber = function () {
        return self.currentQuestion() + 1;
    }

    self.gotoPrevious = function () {
        var currentIndex = self.currentQuestion();

        if (currentIndex > 0) {
            self.currentQuestion(currentIndex - 1);
            $("#alert-area").addClass('hide');
        }
    }

    self.gotoNext = function () {
        var currentIndex = self.currentQuestion();

        if ((currentIndex + 1) < self.questionsCount() && self.questions()[currentIndex]['currentAnswer']() !== -2) {
            self.currentQuestion(currentIndex + 1);
            $("#alert-area").addClass('hide');
        }
    }

    self.previousDisabled = function () {
        if (self.currentQuestion() === 0) {
            return true;
        }
        else {
            return false;
        }
    }

    self.nextDisabled = function () {
        var currentIndex = self.currentQuestion();

        if (self.questionsCount() <= (currentIndex + 1) || self.questions()[currentIndex].currentAnswer() === -2) {
            return true;
        }
        else {
            return false;
        }
    }

    self.submitAnswer = function () {
        var currentQuestion = self.currentQuestion();
        var availableAnswers = self.questions()[currentQuestion]['answers'].length;
        var myAnswer = $('ul#answers input:radio:checked').val();
        var displayAlert = true;

        if (typeof myAnswer === 'undefined') {
            displayAlert = true;
        }
        else {
            myAnswer = parseInt(myAnswer, 10);

            if (myAnswer > -2 && myAnswer < availableAnswers) {
                displayAlert = false;
            }
        }

        if (displayAlert === true) {
            $("#alert-area").removeClass('hide');
        }
        else {
            $("#alert-area").addClass('hide');

            self.questions()[currentQuestion].currentAnswer(myAnswer);
            var currentIndex = self.currentQuestion();

            if (currentIndex === (self.questionsCount() - 1)) {
                self.quizState('results');
            }
            else {
                self.currentQuestion(currentIndex + 1);
            }
        }
    }

    self.answersCorrect = function () {
        var val = 0;

        for (var i = 0; i < self.questionsCount(); i++) {
            if (self.questions()[i]['currentAnswer']() !== -2) {
                if (self.questions()[i]['currentAnswer']() === self.questions()[i]['correctAnswer']) {
                    val++;
                }
            }
        }

        return val;
    }

    self.answersIncorrect = function () {
        var val = 0;

        for (var i = 0; i < self.questionsCount(); i++) {
            if (self.questions()[i]['currentAnswer']() !== -2) {
                if (self.questions()[i]['currentAnswer']() !== -1 && self.questions()[i]['currentAnswer']() !== self.questions()[i]['correctAnswer']) {
                    val++;
                }
            }
        }

        return val;
    }

    self.answersSkipped = function () {
        var val = 0;

        for (var i = 0; i < self.questionsCount(); i++) {
            if (self.questions()[i]['currentAnswer']() !== -2) {
                if (self.questions()[i]['currentAnswer']() === -1) {
                    val++;
                }
            }
        }

        return val;
    }

    self.displayCorrectAnswers = function () {
        var data = [];

        for (var i = 0; i < self.questionsCount(); i++) {
            var correctAnswerId = self.questions()[i]['correctAnswer'];
            var yourAnswerId = self.questions()[i]['currentAnswer']();
            var yourAnswer = '';
            var yourAnswerCssClass = '';

            if (yourAnswerId === -1) {
                yourAnswer = 'Skipped';
                yourAnswerCssClass = 'skipped summary-skipped'
            }
            else if (yourAnswerId !== -2) {
                yourAnswer = self.questions()[i]['answers'][yourAnswerId].answer;

                if (yourAnswerId === correctAnswerId) {
                    yourAnswerCssClass = 'correct';
                }
                else {
                    yourAnswerCssClass = 'incorrect';
                }
            }


            var question = self.questions()[i].question;
            var correctAnswer = self.questions()[i]['answers'][correctAnswerId].answer;

            data.push({'number': i + 1, 'question': question, 'correctAnswer': correctAnswer, 'yourAnswer': yourAnswer, 'cssClass': yourAnswerCssClass});
        }

        return data;
    }

    self.pointsTotal = function () {
        var points = 0;

        for (var i = 0; i < self.questionsCount(); i++) {
            var ca = self.questions()[i]['currentAnswer']();

            if (ca >= 0) {
                var correctAnswerId = self.questions()[i]['correctAnswer'];
                var yourAnswerId = self.questions()[i]['currentAnswer']();

                if (correctAnswerId === yourAnswerId) {
                    points++;
                }
                else {
                    points--;
                }
            }
        }

        return points;
    }

    self.toggleCorrectAnswerVisibility = function () {
        if (self.correctAnswersVisible() === true) {
            self.correctAnswersVisible(false);
        }
        else {
            self.correctAnswersVisible(true);
        }
    }

    self.restart = function () {
        for (var i = 0; i < self.questionsCount(); i++) {
            self.questions()[i]['currentAnswer'](-2);
        }

        self.currentQuestion(0);
        self.quizState('inGame');
        self.correctAnswersVisible(false);
    }
}