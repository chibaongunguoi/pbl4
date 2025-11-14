import tkinter as tk
from tkinter import ttk
import keyboard


class KeyCaptureDialog:
    """Hộp thoại nhập tổ hợp phím"""

    def __init__(self, parent, title="Nhập tổ hợp phím", existing_mappings=None):
        self.result = None
        self.capturing = False
        self.pressed_keys = set()
        self.last_captured_keys = set()
        self.existing_mappings = existing_mappings or {}
        self.dialog = tk.Toplevel(parent)
        self.dialog.title(title)
        # Increase default dialog height to fit new controls
        self.dialog.geometry("420x300")
        self.dialog.resizable(False, False)
        self.dialog.transient(parent)
        self.dialog.grab_set()

        self.dialog.update_idletasks()
        x = parent.winfo_x() + (parent.winfo_width() // 2) - (400 // 2)
        y = parent.winfo_y() + (parent.winfo_height() // 2) - (200 // 2)
        self.dialog.geometry(f"+{x}+{y}")

        self.createWidgets()
        self.startCapture()

    def createWidgets(self):
        main_frame = ttk.Frame(self.dialog, padding="20")
        main_frame.pack(fill=tk.BOTH, expand=True)

        instruction = ttk.Label(
            main_frame,
            text="Nhập phím hoặc tổ hợp phím\nrồi click OK",
            font=("Segoe UI", 10),
            justify=tk.CENTER,
        )
        instruction.pack(pady=(0, 20))

        display_frame = ttk.Frame(main_frame, relief=tk.SOLID, borderwidth=2)
        display_frame.pack(fill=tk.BOTH, expand=False, pady=(0, 12))
        display_frame.configure(height=100)
        display_frame.pack_propagate(False)

        self.key_display = ttk.Label(
            display_frame,
            text="Nhập phím hoặc tổ hợp phím...",
            font=("Segoe UI", 14, "bold"),
            foreground="#0078D4",
            anchor=tk.CENTER,
        )
        self.key_display.pack(expand=True, fill=tk.BOTH, padx=10, pady=10)

        # Cảnh báo phím đã tồn tại
        self.warning_label = ttk.Label(
            main_frame,
            text="",
            font=("Segoe UI", 9),
            foreground="#C42B1C",
            wraplength=360,
            justify=tk.CENTER,
        )
        self.warning_label.pack(pady=(0, 8))

        quick_frame = ttk.Frame(main_frame)
        quick_frame.pack(fill=tk.X, pady=(0, 8))

        self.mod_ctrl = tk.BooleanVar(value=False)
        self.mod_shift = tk.BooleanVar(value=False)
        self.mod_alt = tk.BooleanVar(value=False)
        self.mod_win = tk.BooleanVar(value=False)

        cb_ctrl = ttk.Checkbutton(
            quick_frame,
            text="Ctrl",
            variable=self.mod_ctrl,
            command=self.onModifierToggle,
        )
        cb_shift = ttk.Checkbutton(
            quick_frame,
            text="Shift",
            variable=self.mod_shift,
            command=self.onModifierToggle,
        )
        cb_alt = ttk.Checkbutton(
            quick_frame,
            text="Alt",
            variable=self.mod_alt,
            command=self.onModifierToggle,
        )
        cb_win = ttk.Checkbutton(
            quick_frame,
            text="Win",
            variable=self.mod_win,
            command=self.onModifierToggle,
        )

        cb_ctrl.grid(row=0, column=0, padx=(0, 6), sticky="w")
        cb_shift.grid(row=0, column=1, padx=(0, 6), sticky="w")
        cb_alt.grid(row=0, column=2, padx=(0, 6), sticky="w")
        cb_win.grid(row=0, column=3, padx=(0, 12), sticky="w")

        # Dropdown (combobox) for selecting a base key with the mouse
        other_keys = [""]
        other_keys += [chr(c) for c in range(ord("a"), ord("z") + 1)]
        other_keys += [str(n) for n in range(0, 10)]
        other_keys += [f"f{n}" for n in range(1, 13)]
        other_keys += [
            "esc",
            "tab",
            "space",
            "enter",
            "backspace",
            "caps lock",
            "insert",
            "delete",
            "home",
            "end",
            "page up",
            "page down",
            "up",
            "down",
            "left",
            "right",
        ]

        self.key_combobox = ttk.Combobox(
            quick_frame,
            values=[k.upper() if len(k) == 1 else k.title() for k in other_keys],
            state="readonly",
            width=20,
        )
        self.key_combobox.set("")
        self.key_combobox.grid(row=0, column=4, padx=(6, 0), sticky="w")
        self.key_combobox.bind("<<ComboboxSelected>>", self.onDropdownSelect)

        # Các nút bấm
        button_frame = ttk.Frame(main_frame)
        button_frame.pack(fill=tk.X)

        self.ok_button = ttk.Button(
            button_frame, text="OK", command=self.handleOk, width=15
        )
        self.ok_button.pack(side=tk.LEFT, padx=(0, 5))
        self.ok_button.bind("<Return>", lambda _: "break")

        self.cancel_button = ttk.Button(
            button_frame, text="Cancel", command=self.handleCancel, width=15
        )
        # Ngăn chặn phím Enter và phím Esc làm đóng hộp thoại
        self.cancel_button.pack(side=tk.LEFT)
        self.cancel_button.bind("<Return>", lambda _: "break")
        self.dialog.bind("<Return>", lambda _: "break")
        self.dialog.bind("<Escape>", lambda _: self.handleCancel())

    def startCapture(self):
        self.capturing = True
        keyboard.hook(self.handleInputKey)

    def handleInputKey(self, event):
        if not self.capturing:
            return

        if event.name in ["enter", "return"]:
            return False

        if event.event_type == "down":
            self.pressed_keys.add(event.name)
            if self.pressed_keys:
                self.last_captured_keys = self.pressed_keys.copy()
            self.checkTable()
        elif event.event_type == "up":
            self.pressed_keys.clear()

        return False

    def checkTable(self):
        """Kiểm tra các chuyển đổi hiện tại để điều hướng giao diện"""
        try:
            keys_to_show = (
                self.pressed_keys if self.pressed_keys else self.last_captured_keys
            )

            if keys_to_show:
                # Sắp xếp các chuyển đổi
                modifier_order = ["ctrl", "shift", "alt", "win"]
                modifiers = [k for k in modifier_order if k in keys_to_show]
                others = [k for k in sorted(keys_to_show) if k not in modifier_order]
                all_keys = modifiers + others
                display_text = " + ".join(all_keys).upper()
                self.key_display.config(text=display_text, foreground="#107C10")

                # Kiểm tra phím bị trùng
                key_string = "+".join(all_keys)
                if key_string in self.existing_mappings:
                    mapped_to = self.existing_mappings[key_string]
                    self.warning_label.config(
                        text=f"⚠ Phím này đã được chuyển đổi thành: {mapped_to.replace('+', ' + ').upper()}"
                    )
                else:
                    self.warning_label.config(text="")
            else:
                self.key_display.config(
                    text="Nhập phím hoặc tổ hợp phím...", foreground="#0078D4"
                )
                self.warning_label.config(text="")
        except tk.TclError:
            # Cửa sổ đã bị đóng, ngừng nhập
            self.capturing = False

    def onModifierToggle(self):
        mods = set()
        if getattr(self, "mod_ctrl", None) and self.mod_ctrl.get():
            mods.add("ctrl")
        if getattr(self, "mod_shift", None) and self.mod_shift.get():
            mods.add("shift")
        if getattr(self, "mod_alt", None) and self.mod_alt.get():
            mods.add("alt")
        if getattr(self, "mod_win", None) and self.mod_win.get():
            mods.add("win")

        sel = ""
        try:
            sel = self.key_combobox.get()
        except Exception:
            sel = ""

        key = sel.lower() if sel else ""
        if key:
            mods.add(key)

        self.last_captured_keys = mods
        self.pressed_keys.clear()
        self.checkTable()

    def onDropdownSelect(self, _=None):
        sel = self.key_combobox.get()
        key = sel.lower()

        mods = set()
        if getattr(self, "mod_ctrl", None) and self.mod_ctrl.get():
            mods.add("ctrl")
        if getattr(self, "mod_shift", None) and self.mod_shift.get():
            mods.add("shift")
        if getattr(self, "mod_alt", None) and self.mod_alt.get():
            mods.add("alt")
        if getattr(self, "mod_win", None) and self.mod_win.get():
            mods.add("win")

        if key:
            mods.add(key)

        if not mods:
            return

        self.last_captured_keys = mods
        self.pressed_keys.clear()
        self.checkTable()

    def handleOk(self):
        keys_to_use = (
            self.pressed_keys if self.pressed_keys else self.last_captured_keys
        )

        if keys_to_use:
            # Sắp xếp các phím
            modifier_order = ["ctrl", "shift", "alt", "win"]
            modifiers = [k for k in modifier_order if k in keys_to_use]
            others = [k for k in sorted(keys_to_use) if k not in modifier_order]
            all_keys = modifiers + others
            self.result = "+".join(all_keys)
        else:
            self.result = None

        # Ngừng nhập tổ hợp phím
        self.stopCapture()
        try:
            self.dialog.destroy()
        except Exception:
            pass

    def handleCancel(self):
        self.stopCapture()
        self.result = None
        try:
            self.dialog.destroy()
        except Exception:
            pass

    def stopCapture(self):
        self.capturing = False
        try:
            keyboard.unhook_all()
        except Exception:
            pass
