__Note:__ Chrome extension is not complete. only backend for adding and removing courses into chrome.storage is implemented. 

# Wrapper over bc's registration software in both the online agora portal lookup and uis
The idea was to figure out a way to implement a 21st century wrapper over the current course registration framework of Boston College with the assumption that BC won't acutally ever implement a unified registration system that isn't still stuck in the 80s.

The basic principle is that the wrapper would wrap over the current system create a backend that would interact with the current system in a way that makes it more convenient for a modern computer user. The wrapper consists of two components: 1) a chrome extension that adds additional functionality to the "Course Information and Schedule" page and 2) a python based backend that interacts with the IBM mainframe and registers users.

A couple ways to link the two components:

    1) host a web server based on the flask microframework that takes requests from the chrome extension
    
    2) ditch the python backend and find a js based terminal emulator thats scriptable and incorporate it into the extension
    
    (__note:__ nothing is acutally linked yet)
    
__Big note: I actually don't know if it's against school policy to modify the portal webpage or scrape data with a script. Please no one get me in trouble__

__smaller note:__ If I am against school policy please let me know as soon as possible, I will cease and desist.

### Python Backend
    Requires Python 3

    Requires x3270 on PATH
      get it from: http://x3270.bgp.nu/

    Requires package py3270

    main.py has object 'Handler' that has methods to interact with the IBM mainframe.

    Quick outline of functionality:

    Handler(host=None, visible=False, timeout=30, app=None, args=None)
      inits handler instance. Handler instance extends the Emulator class from py3270 this will be the main point of interaction.
      Host default is 'N:bcvmcms.bc.edu' ('N:' is required).
      visible=True will show a Terminal window interacting with the mainframe.

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
 
 ### Chrome Extension
    Adds a button to add to or remove courses from a shortlist.

    the shortlist holds the courses that have been selected. 
    
    Generates a mock timetable to easily visualize 

    on add: extension scrapes the course details page and adds the data into the shortlist

