from py3270 import Emulator


class LoginError(Exception):
    pass


class NavigationError(Exception):
    pass


class NotAvailableError(Exception):
    pass


class Handler(Emulator):
    coords = {"login": {"username": (7, 46), "password": (9, 46)}}
    host = "N:bcvmcms.bc.edu"

    def __init__(self, host=None, visible=False, timeout=30, app=None, args=None):
        if host is not None:
            self.host = host
        super().__init__(visible, timeout, app, args)
        self.connect(self.host)
        self.wait_for_field()
        print("Handler Initialized")
        self.location = "login"

    def login(self, username, password):
        # login user
        self.send_string(username, *self.coords["login"]["username"])
        self.send_string(password, *self.coords["login"]["password"])
        self.send_enter()

        # wait for load
        self.wait_for_field()

        # check login state; if false raise login error
        if self.string_found(7, 59, "NOT VALID USERNAME") or self.string_found(9, 65, "NOT VALID"):
            raise LoginError("Incorrect Username/Password")

        print("Login Successful")
        self.location = "main"

    def logoff(self):
        if self.location == "main":
            self.send_string("L")
            self.send_enter()

        self.location = "login"
        print("Logoff Successful")

    def menu(self, dest):
        if self.location != "main":
            raise NavigationError("Not on page: main")
        self.move_to(16, 22)

        if dest == "audit":
            self.send_string("A")
            self.location = "audit"
        elif dest == "search":
            self.send_string("C")
            self.location = "search"
        elif dest == "register":
            self.send_string("R")
            self.location = "register"
        elif dest == "passfail":
            self.send_string("P")
            self.location = "passfail"
        elif dest == "exam":
            self.send_string("X")
            self.location = "exam"
        elif dest == "logoff":
            self.send_string("L")
            self.location = "login"
        else:
            raise NavigationError("Destination does not exist")

        print(self.string_get(16, 24, 36))


        self.send_enter()
        self.wait_for_field()
        if self.string_get(16, 24, 36) == "SELECTION NOT AVAILABLE AT THIS TIME":
            raise NotAvailableError("Selection not available at this time")

        print("Navigation Successful")

    def goto(self, dest):
        '''
        goto method navigates terminal to destination from any origin.
        if destination is the same as current location method exits
        '''

        if self.location == dest:
            return

        # following conditional statements returns program to main
        if self.location == "audit":
            self.send_string(" ")
        elif self.location == "search":
            self.send_string("quit", 3, 24)
        elif self.location == "register":
            # TODO: Implement registration
            pass
        elif self.location == "passfail":
            # TODO: Implement passfail
            pass
        elif self.location == "exam":
            pass

        self.wait_for_field()

        self.location = "main"
        self.menu(dest)



    def search(self, code, semester="", status="A", title="", instructor=""):
        '''
        searches for courses.
        THIS IS NOT THE SAME AS THE rsearch METHOD
        '''

        # Navigate to search
        self.goto("search")

        if len(code) <= 8:
            self.send_string(code, 2, 24)
        else:
            raise ValueError("Code query exceeds 8 characters in lengh")

        if len(semester) <= 1 and semester in "abAB":
            self.send_string(semester, 2, 24)
        else:
            if isinstance(semester, int):
                raise TypeError("Semester query must be of str instance")
            elif isinstance(semester, str):
                raise ValueError("Semester query must be 'A' or 'B'")

        if len()


host = "N:bcvmcms.bc.edu"
username = "chodr"
password = "East5sea"


e = Handler(visible=True)
# e.connect(host)
e.wait_for_field()
e.login(username, password)
e.menu("register")
# e.logoff()


input()
