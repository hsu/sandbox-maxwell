# Write your code here :-)

import requests

people = requests.get("http://api.open-notify.org/astros.json")

print(people.text)

people_json = people.json()

print("the number of people in space today: ", people_json["number"])

for p in people_json["people"]:
    print(p["name"])
