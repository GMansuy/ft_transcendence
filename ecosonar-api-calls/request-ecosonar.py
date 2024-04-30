import requests
import sys
from colorama import Fore, Back, Style

def help() :
	print('Available commands :\n\
-geturl\n\
-posturl <url1> <url2> <url3> ... \n\
-delurl <url>\n\
-analysis\n\
-retrieve'
)

def geturls(url, project_name) :
	url += 'all?projectName=' + project_name
	response = requests.get(url)
	print(response.text)

def posturls(url, project_name, query) :
	if (len(query) <= 1) :
		print('No urls provided')
		return 1

	url += 'insert'
	dto = { "projectName" : project_name, "urlName": query[1:]}
	response = requests.post(url, json = dto)
	print(response)

def delurl(url, project_name, query) :
	if (len(query) <= 1) :
		print('No url provided')
		return 1

	url += 'delete'
	dto = { "projectName" : project_name, "urlName": query[1]}
	response = requests.delete(url, json = dto)
	print(response)

def analysis(url, project_name) :
	url += 'greenit/insert'
	dto = { "projectName" : project_name}
	response = requests.post(url, json = dto)
	print(response)

def retrieve(url, project_name) :
	url += 'greenit/project?projectName=' + project_name
	response = requests.get(url)
	print(response.text)
	with open("flask-api/ecosonar-output.json", "w") as file:
		file.write(response.text)
	print("Ecosonar output was saved in 'flask-api/ecosonar-output.json' !")


# /api/greenit/insert

def make_requests(url, project_name):

	while 1 :
		current_url = url

		prompt = input(Fore.RED + Style.BRIGHT + 'Request Ecosonar ' + Fore.GREEN + '➜  ' + Fore.WHITE )
		query = prompt.split()
		if not query :
			return 0

		if (query[0] in ('geturl', 'geturls', 'get', 'urls')) :
			geturls(current_url, project_name)
		elif (query[0] in ('posturl', 'posturls', 'post')) :
			posturls(current_url, project_name, query)
		elif (query[0] in ('delurl', 'delurls', 'deleteurl', 'deleteurls', 'del')) :
			delurl(current_url, project_name, query)
		elif (query[0] in ('analysis', 'ana')) :
			analysis(current_url, project_name)
		elif (query[0] in ('retrieve', 'ret')) :
			retrieve(current_url, project_name)
		elif (query[0] in ('q', 'quit', 'exit')) :
			return 0
		elif (query[0] in ('h', 'help')) :
			help()
		else :
			print(query[0], ': Unknown command !\n')

url = 'http://localhost:3000/api/'
project_name = 'eco-sonar-test'
args = sys.argv[0:]

if (len(args) <= 1) :
	make_requests(url, project_name)
else :
	query = args[1:]

	if (args[1] == '--help') :
		help()
	elif (args[1] == '-geturl') :
		geturls(url, project_name)
	elif (args[1] == '-posturl') :
		posturls(url, project_name, query)
	elif (args[1] == '-delurl') :
		delurl(url, project_name, query)
	elif (args[1] == '-analysis') :
		analysis(url, project_name)
	elif (args[1] == '-retrieve') :
		retrieve(url, project_name)
	else :
		print(args[1], ': Unknown command !\n')
		help()
