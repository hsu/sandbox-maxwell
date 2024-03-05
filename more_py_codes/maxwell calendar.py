

from tkinter import *
import calendar

def show_calendar():
    gui = Tk()
    gui.config(bg="#f0f0f0")
    gui.title("Calendar For The Year")
    gui.geometry("450x525")
    year = int(year_field.get())
    gui_content = calendar.calendar(year)
    cal_year = Label(gui, text=gui_content, fg="black", bg="#f0f0f0", font="times 8 bold")
    cal_year.grid(row=5, column=3, padx=20)
    gui.mainloop()


if __name__ == "__main__":
    new = Tk()
    new.config(bg="#f0f0f0")
    new.title("Calendar")
    new.geometry("400x400")
    cal = Label(new, text="Maxwell Calendar ", fg="#1d1d1d", bg="#f0f0f0", font=("times", 20, "bold"), padx=10, pady=10)
    year = Label(new, text="Enter a Year", fg="#1d1d1d", bg="#f0f0f0", font=("times", 20, "bold"), padx=10, pady=10)
    year_field = Entry(new, justify="center", width=22, fg="Green", font=("times", 12, "bold"))
    button = Button(new, text="Show Calendar", font=("times", 16, "bold"), fg="white", bg="#1976D2", relief="flat", padx=10, pady=10, command=show_calendar)


cal.grid(row=1, column=1, pady=10)
year.grid(row=2, column=1, pady=10)
year_field.grid(row=3, column=1, pady=10)
button.grid(row=4, column=1, pady=10)

new.mainloop()
