questionData = [
    {

        question: '“The Legion of Doom”, one of the league&#039;s most potent and feared lines, was a forward line for the Philadelphia Flyers who played together between 1995 and 1997 comprising Eric Lindros, John LeClair and...',
        answers: [
            { id: 0, answer: 'Mark Recchi' },
            { id: 1, answer: 'Rod Brind&#039;Amour' },
            { id: 2, answer: 'Mikael Renberg' }
        ],
        currentAnswer: ko.observable(-2),
        correctAnswer: 2,
        comment: 'For more information, see <a href="http://en.wikipedia.org/wiki/Legion_of_Doom_%28ice_hockey%29">Wikipedia</a>.'
    },
    {
        question: 'Which goaltender holds the record for most points (including playoffs) as of the 2013-2014 NHL season?',
        answers: [
            { id: 0, answer: 'Grant Fuhr' },
            { id: 1, answer: 'Martin Brodeur' },
            { id: 2, answer: 'Patrick Roy' }
        ],
        currentAnswer: ko.observable(-2),
        correctAnswer: 0,
        comment: 'For more information, see <a href="http://en.wikipedia.org/wiki/List_of_NHL_records_%28individual%29#Goals.2Fassists.2Fpoints_by_position">Wikipedia</a>.'
    },
    {
        question: 'In the history of NHL only three players has scored over 80 goals in a season. They are: Wayne Gretzky, Mario Lemieux and... ',
        answers: [
            { id: 0, answer: 'Teemu Selänne' },
            { id: 1, answer: 'Alexander Mogilny' },
            { id: 2, answer: 'Brett Hull' }
        ],
        currentAnswer: ko.observable(-2),
        correctAnswer: 2,
        comment: 'For more information, see <a href="http://www.quanthockey.com/nhl/records/most-goals-in-one-season-by-nhl-players.html">quanthockey.com</a>.'
    },
    {
        question: 'The first NHL season in which a player scored 100 points was the 1968–69 season. Who was the player to first achieve this record?',
        answers: [
            { id: 0, answer: 'Phil Esposito' },
            { id: 1, answer: 'Gordie Howe' },
            { id: 2, answer: 'Bobby Hull' }
        ],
        currentAnswer: ko.observable(-2),
        correctAnswer: 0,
        comment: 'All of the players Phil Esposito, Bobby Hull and Gordie Howe hit the 100 points mark in the season 1968-69. Phil Esposito was the first in March 2 1969. For more information, see <a href="http://en.wikipedia.org/wiki/List_of_NHL_players_with_100-point_seasons">Wikipedia</a>.'
    },
    {
        question: 'The following players were all selected in the first round of the 2006 entry draft. Who of them was the #1 pick?',
        answers: [
            { id: 0, answer: 'Claude Giroux' },
            { id: 1, answer: 'Erik Johnson' },
            { id: 2, answer: 'Jonathan Toews' }
        ],
        currentAnswer: ko.observable(-2),
        correctAnswer: 1,
        comment: 'For more information, see <a href="http://en.wikipedia.org/wiki/2006_NHL_Entry_Draft">Wikipedia</a>.'
    },
    {
        question: 'Who of the following has not won the Calder Memorial Trophy (“Rookie of the Year” award)?',
        answers: [
            { id: 0, answer: 'Alexander Ovechkin' },
            { id: 1, answer: 'Sidney Crosby' },
            { id: 2, answer: 'Scott Gomez' }
        ],
        currentAnswer: ko.observable(-2),
        correctAnswer: 1,
        comment: 'Scott Gomez won the Calder memorial Trophy in <a href="http://en.wikipedia.org/wiki/Scott_Gomez">1999–2000</a>. Both “Alexander the Great” and “Sid the Kid” entered the league at the start of the 2005-06 season. Ovechkin finished the season leading all NHL rookies in goals and points. After the season ended, Ovechkin received the Calder Memorial Trophy.'
    },
    {
        question: 'Gordie Howe is the only player who have played in the NHL at the age of 50. Who is the second oldest player of all time played in the NHL?',
        answers: [
            { id: 0, answer: 'Mark Messier' },
            { id: 1, answer: 'Maurice Roberts' },
            { id: 2, answer: 'Chris Chelios' }
        ],
        currentAnswer: ko.observable(-2),
        correctAnswer: 2,
        comment: 'For more information, see <a href="http://en.wikipedia.org/wiki/List_of_oldest_National_Hockey_League_players">Wikipedia</a>.'
    },
    {
        question: 'Scott Stevens formed a legendary defensive pairing in New Jersey Devils with...',
        answers: [
            { id: 0, answer: 'Scott Niedermayer' },
            { id: 1, answer: 'Paul Coffey' },
            { id: 2, answer: 'Rob Blake' }
        ],
        currentAnswer: ko.observable(-2),
        correctAnswer: 0,
        comment: 'For more information, see <a href="http://www.rantsports.com/nhl/2013/11/11/new-jersey-devils-scott-stevens-and-scott-niedermayer-greatest-defensive-pairing/">rantsports.com</a>.'
    },
    {
        question: 'Who of the following shared his house in Pittsburgh with Sidney Crosby for four years before Crosby purchased his own house?',
        answers: [
            { id: 0, answer: 'Maxime Talbot' },
            { id: 1, answer: 'Mario Lemieux' },
            { id: 2, answer: 'Marc-André Fleury' }
        ],
        currentAnswer: ko.observable(-2),
        correctAnswer: 1,
        comment: 'For more information, see <a href="http://www.nhl.com/ice/news.htm?id=424363">nhl.com</a>.'
    },
    {
        question: 'One of the following Hall of Famers did never win the Cup, who?',
        answers: [
            { id: 0, answer: 'Ray Bourque' },
            { id: 1, answer: 'Ed Belfour' },
            { id: 2, answer: 'Mats Sundin' }
        ],
        currentAnswer: ko.observable(-2),
        correctAnswer: 2,
        comment: 'Both Ray Bourque and Ed Belfour won the Stanley Cup once (Ray Bourque won the Cup in his last game). Mats Sundin, the long-time Leafs captain, never got to play past the Conference Finals.'
    },
    {
        question: 'Alex Ovechkin is climbing fast on the Russian point scorer top list. But who is the all-time regular season Russian point leader in the NHL?',
        answers: [
            { id: 0, answer: 'Sergei Fedorov' },
            { id: 1, answer: 'Alexei Kovalev' },
            { id: 2, answer: 'Pavel Bure' }
        ],
        currentAnswer: ko.observable(-2),
        correctAnswer: 0,
        comment: 'For more information, see <a href="http://en.wikipedia.org/wiki/List_of_NHL_statistical_leaders_by_country#Russia">Wikipedia</a>.'
    },
    {
        question: 'Craig MacTavish ended an era in the NHL. He was the last player in the league to play without a helmet. In what year did this happen?',
        answers: [
            { id: 0, answer: '1977' },
            { id: 1, answer: '1987' },
            { id: 2, answer: '1997' }
        ],
        currentAnswer: ko.observable(-2),
        correctAnswer: 2,
        comment: 'Craig MacTavish was the last player to play under the “helmetless grandfather clause” and suprisingly it was in the 90&#039;s. For more information, see <a href="http://video.nhl.com/videocenter/console?id=38664">nhl.com</a>.'
    },
    {
        question: 'In which city Mark Messier became “the Messiah”?',
        answers: [
            { id: 0, answer: 'Edmonton' },
            { id: 1, answer: 'New York' },
            { id: 2, answer: 'Vancouver' }
        ],
        currentAnswer: ko.observable(-2),
        correctAnswer: 1,
        comment: 'In 1994 Messier became “the Messiah” in New York, leading the Rangers to their first Stanley Cup championship since 1940. For more information, see <a href="http://www.greatesthockeylegends.com/2009/04/stanley-cup-legends-messiah-mark.html">greatesthockeylegends.com</a>.'
    },
    {
        question: 'Who is the legendary #20 in this picture?<br><img class="img-responsive" src="img/20.jpg" alt="Number 20">',
        answers: [
            { id: 0, answer: 'Tony Granato' },
            { id: 1, answer: 'Marty McSorley' },
            { id: 2, answer: 'Luc Robitaille' }
        ],
        currentAnswer: ko.observable(-2),
        correctAnswer: 2,
        comment: 'The picture was taken from a SCORE 1992 NHL Trading Card. Here is backside of the card:<br><img class="img-responsive" src="img/20_back.jpg" alt="Number 20">'
    }
];