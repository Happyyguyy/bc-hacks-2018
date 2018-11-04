Requires Python 3

Requires x3270 on PATH
  get it from: http://x3270.bgp.nu/ 
  
Requires package py3270

main.py has object 'Handler' that has methods to interact with the IBM mainframe. 

Quick outline of functionality:

Handler(host=None, visible=False, timeout=30, app=None, args=None)
  init's handler instance. this will be the main point of interaction
  Host default is 'N:bcvmcms.bc.edu' ('N:' is required)
  visible=True will show a Terminal window interacting with the mainframe
  
Handler.login(self, username, password)
  with params uusername and password handler will login to the mainframe

Handler.logoff(self)
  will logoff of mainframe from whatever position
  
Handler.search(self, code, semester="", status="A", title="", instructor="")
  will search through course database with supplied params
  only works if logged in
  returns list of all matches
  
Handler.more_info(self, code)
  will open a browser window straight to the BC course listings. 
  bc servers will prompt a login and redirect to the reqeusted course information page
