from py3270 import Emulator
import re
from pprint import pprint
import webbrowser
import time


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

        # search course by code
        if re.fullmatch("[a-zA-Z]{2,4}[0-9]{0,4}", code):
            # code must match regex for it to pass else raise ValueError
            self.send_string(code, 3, 24)
        else:
            raise ValueError("Code query is not in proper format")

        # semester selector
        if len(semester) <= 1 and semester in "SFsf":
            self.send_string(semester, 2, 24)
        else:
            if isinstance(semester, int):
                raise TypeError("Semester query must be of str instance")
            elif isinstance(semester, str):
                raise ValueError("Semester query must be 'A' or 'B'")

        # open/closed course selector
        if isinstance(status, str) and status in "AaOo":
            self.send_string(status, 4, 24)
        elif not isinstance(status, str):
            raise TypeError(
                "Status query must be of str instance")
        elif status not in "AaOo":
            raise ValueError("Status query must be 'A' or 'B'")

        # search by title
        if re.fullmatch("[a-zA-Z ]{0,13}", str(title)):
            self.send_string(title, 5, 28)
        elif not isinstance(title, str):
            raise TypeError()
        elif len(title) > 13:
            raise ValueError(
                "Title query must be 13 characters or shorter and not contain numbers")


        if re.fullmatch("[a-zA-Z ]{0,13}", str(instructor)):
            self.send_string(instructor, 5, 57)
        elif not isinstance(instructor, str):
            raise TypeError("Instructor query must be of str instance")
        elif len(instructor) > 13:
            raise ValueError(
                "Instructor query must be 13 characters or shorter and not contain numbers")

        self.send_enter()
        self.wait_for_field()

        result = self.get_result()
        print("Returned result")
        return result

    def get_result(self):
        data = []

        while 1:
            for n in range(8, 24):
                # iterates though lines and pages till end of list where it returns data
                title = self.string_get(n, 23, 22)
                index = self.string_get(n, 2, 4)
                course = self.string_get(n, 7, 10)
                cr = self.string_get(n, 19, 1)
                lvl = self.string_get(n, 21, 1)
                schedule = self.string_get(n, 46, 11)
                instructor = self.string_get(n, 58, 8)
                comment = self.string_get(n, 66, 15)

                if index == "  *E":
                    return data

                row = {
                    "title": title,
                    "index": index,
                    "course": course,
                    "cr": cr,
                    "lvl": lvl,
                    "schedule": schedule,
                    "instructor": instructor,
                    "comment": comment
                }
                data.append(row)

            self.wait_for_field()
            self.send_enter()

    def more_info(self, code):
        year = time.strftime("%Y")

        if int(time.strftime("%U")) > 26:
            cterm = year + "F"
            rterm = str(int(year)+1) + "S"
        else:
            cterm = year + "S"
            rterm = year + "F"

        webbrowser.open(
            f"https://services.bc.edu/courseinfosched/main/courseinfoschedResults!displayOneCourseMethod.action?courseKey={rterm}+{code.upper()}&presentTerm={cterm}&registrationTerm={rterm}")


host = "N:bcvmcms.bc.edu"
username = "chodr"
password = "East5sea"


e = Handler(visible=True)
# e.connect(host)
e.wait_for_field()
e.login(username, password)
search = e.search("econ")
pprint(search)
# e.logoff()
e.more_info("Econ115008")
