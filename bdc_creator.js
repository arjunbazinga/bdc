function init() {

  // create Form
  var formName = "BDC";
  var form = FormApp.create(formName);

  var ss = SpreadsheetApp.create(formName + " Responses")
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  // add triggers
  ScriptApp.newTrigger(onSubmitCustom)
    .forSpreadsheet(ss)
    .onFormSubmit()
    .create();


  var format = [
    ["Thoughts and Feelings",
      [
        "Feeling sad or down in the dumps",
        "Feeling unhappy or blue",
        "Crying spells or tearfulness",
        "Feeling discouraged",
        "Feeling hopeless",
        "Low self esteem",
        "Feeling worthless or inadequate",
        "Guilt or shame",
        "Criticizing yourself or blaming other",
        "Difficulty making decisions"
      ]
    ],

    [
      "Activities and Personal Relationships",
      [
        "Loss of interest in family, friends or colleagues",
        "Loneliness",
        "Spending less time with family or friends",
        "Loss of motivation",
        "Loss of interest in work or other activities",
        "Avoiding work or other activities",
        "Loss of pleasure or satisfaction in life"
      ]
    ],

    ["Physical Symptoms",
      [
        "Feeling tired",
        "Difficulty sleeping or sleeping too much",
        "Decreased or increased appetite",
        "Loss of interest in sex",
        "Worrying about your health"
      ]
    ],

    ["Suicidal Urges",
      [
        "Do you have any suicidal thoughts?",
        "Would you like to end your life?",
        "Do you have a plan for harming yourself?"
      ]
    ]
  ]


  //create Form Elements.
  format.forEach(function (element) {
    var Title = element[0];
    form.addSectionHeaderItem()
      .setTitle(Title);
    var questions = element[1]
    questions.forEach(function (Q) {
      var item = form.addMultipleChoiceItem();
      item.setTitle(Q)
        .setRequired(true)
        .setChoices([
          item.createChoice("Not At All"),
          item.createChoice("Somewhat"),
          item.createChoice("Moderately"),
          item.createChoice("A Lot"),
          item.createChoice("Extremely"),
        ]);
    });
  });


  var link = form.getPublishedUrl()
  installedSuccessfully(link)
  

}

function installedSuccessfully(link){
  Logger.log(link);
  var title = "BDC Installed";
  var body = "You can access the form at : " + link
  body = body + " feel free to modify this event to your liking "
  body = body + "if this link doesn't work open your google drive to access form"
  CalendarApp.getDefaultCalendar().createEvent(title, new Date(), new Date(), {
    description: body
  });
}


function getbody(values) {
Logger.log(values)
  var total = 0;
  for (var key in values) {
  var ans = values[key];
    switch (ans) {
      case "Not At All":
        break;
      case "Somewhat":
        total  = total +  1;
        break;
      case "Moderately":
        total  = total +  2;
        break;
      case "A Lot":
        total = total + 3;
        break;
      case "Extremely":
        total = total + 4;
        break;
    }
  }
  var Status = "";
  if (total < 6) {
    Status = "No Depression";
  } else {
    if (total < 11) {
      Status = "Normal but unhappy";
    } else {
      if (total < 26) {
        Status = "Mild depression";
      } else {
        if (total < 51) {
          Status = "Moderate depression";
        } else {
          if (total < 76) {
            Status = "Severe depression";
          } else {
            Status = "Extreme depression";
          }
        }
      }
    }
  }

  return "Score: " + total + " Status: " + Status
}

function run(){
e = {Values:["Somewhat"]}
onSubmitCustom(e)
}

function onSubmitCustom(e) {
  var color = CalendarApp.EventColor.RED;
  var title = "BDC Results"

  var body = getbody(e.Values);

  CalendarApp.getDefaultCalendar().createEvent(title, new Date(), new Date(), {
    description: body
  }).setColor(color);

}