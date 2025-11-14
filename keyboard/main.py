from src.keyboard_remapper_gui import KeyboardRemapperGUI
import tkinter as tk
from tkinter import messagebox


def main():
    try:
        root = tk.Tk()
        _ = KeyboardRemapperGUI(root)
        root.mainloop()
    except Exception as e:
        messagebox.showerror("Lỗi", f"Lỗi ứng dụng: {e}")


if __name__ == "__main__":
    main()
