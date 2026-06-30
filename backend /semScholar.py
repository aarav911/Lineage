import requests
from dotenv import load_dotenv
import os
import json
from graph import DirectedGraph


load_dotenv()

SEM_SCHOLAR = os.getenv('SEM_SCHOLAR')

# graph class


#api call functions


def search_for_paper(title):
    url = f"https://api.semanticscholar.org/graph/v1/paper/autocomplete/"

    query_params = {"query" : title}
    headers = {"x-api-key": SEM_SCHOLAR}

    res = requests.get(url, params=query_params, headers=headers)
    if res.status_code != 200:
        print("Error occured: " + res.text)
        return "error"
    if(not res.json()['matches']):
        print("Sorry, no paper found.")
    i = 1
    for match in res.json()['matches']:
        print("Paper No: " +str(i))
        print("ID: " +match['id'])
        print("Authors and year: " +match['authorsYear'])
        print("Title: " +match['title'] + "\n")
        i+=1
    return res.text


def select_paper(papers):
    if isinstance(papers, str):
        data = json.loads(papers)
    else:
        data = papers
    try:
        index = int(input("Enter the paper no. of your choice: "))
        return data['matches'][index-1]
    except (ValueError, IndexError, KeyError) as e:
        print(f"Error: Invalid selection or data format. ({e})")
        return None

def get_citations_references(paper):
    url = f"https://api.semanticscholar.org/graph/v1/paper/{paper['id']}/references/"

    
    headers = {"x-api-key": SEM_SCHOLAR}

    res = requests.get(url, headers=headers)
    a = []
    a.append(res.text)
    url = f"https://api.semanticscholar.org/graph/v1/paper/{paper['id']}/citations/"

    
    headers = {"x-api-key": SEM_SCHOLAR}

    res = requests.get(url, headers=headers)
    a.append(res.text)
    return a
    


papers = search_for_paper("DNA")
if(papers != "error"): 
    selected_paper = select_paper(papers=papers)
    print()
    print("You successfully selected: " +selected_paper['title'] + "\n")
    cit_and_ref = get_citations_references(selected_paper)
    print("references: " +cit_and_ref[0]+"\n")
    print("citations: " + cit_and_ref[1]+"\n")






# The goal is to get a paper title for a user, and depth (of search) (around 2-4)... 
# and return a graph of papers 
# The algorithm: is something like 
# 1. check is paper exists. if yes, make the node. 
# 2. find out its references. and citations. Add all of them as nodes, and make all the directed connections. 
# 3. while(depth >0): "populate the graph"... ie go through each added node, and do step 2 for them. depth--;
