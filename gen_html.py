#!/usr/bin/env python
# coding: utf-8

# In[1]:


schema = [
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


# In[2]:


def getForm(schema):
    form_head = "<div>"
    mid = ""
    for s in range(len(schema)):
        mid += getSection(s, schema[s])
    form_tail = """</div><br><input type="button" id="ans" value="Ans"><br><div id="ans_div"></div>"""
    return form_head + mid + form_tail


# In[3]:


def getSection(s, section):
    section_head = f"<div id=section_{s}>" +f"<h3>{section[0]}</h3>"
    mid = ""
    for q in range(len(section[1])):
        mid += getQuestion(s,q,section[1][q])
    section_tail = "</div>"
    return section_head + mid + section_tail


# In[4]:


id_to_score = {}
id_to_question = {}
def getQuestion(s, q, question):
    options = ["Not At All","Somewhat","Moderately","A Lot","Extremely"]
    question_head = "<div>" + question + "<br>\n"
    mid = ""
    for o in range(len(options)):
        mid += f"<input type=\"radio\" Name=\"{str(s)+str(q)}\" id=\"{str(s)+str(q)+str(o)}\"> {options[o]}</input><br>"
        id_to_score[str(s)+str(q)+str(o)]=o
        id_to_question[str(s)+str(q)+str(o)]=str(s)+str(q)
    question_end = "</div><br>"
    return question_head + mid + question_end


# In[5]:


head_html = """<html>

<head>


  <meta name=viewport content='width=700'>
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="theme-color" content="#000000">
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
  <meta name="HandheldFriendly" content="true">
  <meta name="apple-mobile-web-app-capable" content="yes">

</head>
<Title>Jargonizer</Title>

<body>
  <style>
    body {
                margin: auto;
                background: #fffde8;
                padding: 10px;
                text-align: left;
                align-items: left;
            }
            textarea{
                margin: auto;
                min-width: 95%;
                max-width: 100%;
                min-height: 40%;
                margin-bottom:  5%;	            
                border-radius: 6px;
                box-shadow: 2px 2px 8px rgba(black, .3);
                border: 1
            }
            textarea #output_area {
                margin-bottom: 10%
            }
            ::-moz-selection {
                background: yellow;
            }
            ::selection {
                background: yellow;
            }    
    
        </style>
  <h2>Burns Depression Checklist</h2>
"""


# In[6]:


tail_html =   """
  <div style="text-align: center">
    <br>
    <br>
    <a href="https://twitter.com/arjunbazinga">@arjunbazinga</a>
  </div>

</body>

</html>
"""


# In[13]:


def get_js(id_to_score, id_to_question):
    js_head = "<script>ans = {};"
    ans = ""
    for i in id_to_score:
        ans += "document.getElementById(\""+str(i)+"\").onclick = function ()" + "{ans[\""+ str(id_to_question[i]) + "\"]=" +str(id_to_score[i])+";};"
    js_tail = """ document.getElementById("ans").onclick = function (){
    var total = 0;
    for (var i in ans) {
    total += ans[i];
    }
document.getElementById("ans_div").innerHTML = total;}
    </script>"""
    
    return js_head + ans + js_tail


# In[14]:


js = get_js(id_to_score, id_to_question)


# In[15]:


html_struct = getForm(schema)


# In[16]:


final = head_html + html_struct + js + tail_html


# In[17]:


with open("index.html", "w") as f:
    f.write(final)


# In[19]:


js


# In[20]:


final


# In[ ]:




