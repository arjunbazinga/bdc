var current = 0
var s_id = 0;
var ans = {}
var qs = ['Feeling sad or down in the dumps',
    'Feeling unhappy or blue',
    'Crying spells or tearfulness',
    'Feeling discouraged',
    'Feeling hopeless',
    'Low self esteem',
    'Feeling worthless or inadequate',
    'Guilt or shame',
    'Criticizing yourself or blaming other',
    'Difficulty making decisions',
    'Loss of interest in family, friends or colleagues',
    'Loneliness',
    'Spending less time with family or friends',
    'Loss of motivation',
    'Loss of interest in work or other activities',
    'Avoiding work or other activities',
    'Loss of pleasure or satisfaction in life',
    'Feeling tired',
    'Difficulty sleeping or sleeping too much',
    'Decreased or increased appetite',
    'Loss of interest in sex',
    'Worrying about your health',
    'Do you have any suicidal thoughts?',
    'Would you like to end your life?',
    'Do you have a plan for harming yourself?'
]

ss = ['Thoughts and Feelings',
    'Activities and Personal Relationships',
    'Physical Symptoms',
    'Suicidal Urges'
]

function getcategoryId() {
    if (current < 10) {
        return 0
    }
    if (current < 17) {
        return 1
    }
    if (current < 22) {
        return 2
    }
    return 3
}

function hide(e) {
    var t = document.getElementById(e)
    if (t.style.display != "none") {
        t.style.display = "none"
    }
}

function show(e) {
    var t = document.getElementById(e)
    if (t.style.display != "block") {
        t.style.display = "block"
    }
}

function select(e) {
    var t = document.getElementById(e)
    if (t.style.background != "#e7e6d3") {
        t.style.background = "#e7e6d3"
    }
}

function unselect(e) {
    var t = document.getElementById(e)
    if (t.style.background != "#fffde8") {
        t.style.background = "#fffde8"
    }
}

function next_handler(qans) {
    if (current < 25) {
        current += 1
        draw()
    }
}


function back_handler() {
    if (current > 0) {
        if (current == 25) {
            show("page")
            hide("results")
        }
        current -= 1
        draw()
    }
}


function Category() {
    var ns_id = getcategoryId()
    if (s_id != ns_id) {
        s_id = ns_id
        document.getElementById("category").innerHTML = ss[s_id]
    }
}

function Options() {
    if (!(ans[current] === undefined)) {
        var t = ans[current]
        console.log(t)
        for (i = 0; i < 5; i++) {
            if (t == i) {
                select(i)
            } else {
                unselect(i)
            }
        }

    }
}

function Question() {
    document.getElementById("question").innerHTML = qs[current]
}


function Progress() {
    document.getElementById("progress").innerHTML = current + 1 + " / " + 25
}


function Back() {
    if (current == 0) {
        hide("back")
    } else {
        show("back")
    }
}

function Next() {
    if (ans[current] === undefined) {
        hide("next")
    } else {
        show("next")
    }
}


function calculate_total() {
    var total = 0;
    for (var i in ans) {
        total += ans[i];
    }
    return total
}


function Score() {
    document.getElementById("score").innerHTML = "Total : " + calculate_total();
}


function draw() {
    Back()
    Next()
    if (current != 25) {
        Category()
        Question()
        Progress()
        Options()
        show("page")
        hide("results")

    } else {
        Score()
        hide("page")
        show("results")
    }
}

document.getElementById("0").onclick = function() {
    ans[current] = 0
    next_handler()
}
document.getElementById("1").onclick = function() {
    ans[current] = 1
    next_handler()
}
document.getElementById("2").onclick = function() {
    ans[current] = 2
    next_handler()
}
document.getElementById("3").onclick = function() {
    ans[current] = 3
    next_handler()
}
document.getElementById("4").onclick = function() {
    ans[current] = 4
    next_handler()
}

document.getElementById("back").onclick = back_handler;
document.getElementById("next").onclick = next_handler;
document.getElementById("test").onclick = test_handler;

Notification.requestPermission().then(function(result) {
    console.log(result);
});

function test_handler() {
    console.log("YAY");
    if (!Notification || Notification.permission !== "granted") {
        console.log("failed");
    } else {
        var notification = new Notification("Hi there!");
    }
}
addEventListener('push', ev => {
    if (!Notification || Notification.permission !== "granted") {
        console.log("failed");
    } else {
        var notification = new Notification({body:ev.data.text()});
    }

})