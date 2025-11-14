import tkinter as tk
from tkinter import ttk, messagebox
import keyboard
import json
import os


from src.key_capture_dialog import KeyCaptureDialog


class KeyboardRemapperGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Bộ chuyển đổi phím")
        self.root.geometry("800x600")
        self.root.minsize(700, 500)

        self.config_file = "key_mappings.json"
        self.mappings = {}
        self.remapper_active = False
        self.active_hooks = []
        self.active_hotkeys = []

        self.loadMappings()
        self.createWidgets()
        self.root.protocol("WM_DELETE_WINDOW", self.handleClosing)

    def createWidgets(self):
        style = ttk.Style()
        style.theme_use("vista")
        main_container = ttk.Frame(self.root, padding="15")
        main_container.pack(fill=tk.BOTH, expand=True)

        title_frame = ttk.Frame(main_container)
        title_frame.pack(fill=tk.X, pady=(0, 15))

        title_label = ttk.Label(
            title_frame, text="BỘ CHUYỂN ĐỔI PHÍM", font=("Segoe UI", 16, "bold")
        )
        title_label.pack(side=tk.LEFT)

        self.toggle_button = ttk.Button(
            title_frame, text="BẬT", command=self.toggleRemapper, width=15
        )
        self.toggle_button.pack(side=tk.RIGHT)

        self.status_label = ttk.Label(
            title_frame,
            text="Trạng thái: Đã tắt",
            font=("Segoe UI", 10),
            foreground="#666",
        )
        self.status_label.pack(side=tk.RIGHT, padx=(0, 10))

        desc_label = ttk.Label(
            main_container,
            text="Chuyển đổi từ phím này sang phím kia. Các chuyển đổi được áp dụng khi bật bộ chuyển đổi.",
            font=("Segoe UI", 9),
            foreground="#666",
        )
        desc_label.pack(fill=tk.X, pady=(0, 15))

        table_frame = ttk.Frame(main_container)
        table_frame.pack(fill=tk.BOTH, expand=True, pady=(0, 15))

        columns = ("from_key", "to_key")
        self.tree = ttk.Treeview(
            table_frame,
            columns=columns,
            show="headings",
            selectmode="browse",
            height=15,
        )

        self.tree.heading("from_key", text="Đầu vào")
        self.tree.heading("to_key", text="Đầu ra")

        self.tree.column("from_key", width=300, anchor=tk.W)
        self.tree.column("to_key", width=300, anchor=tk.W)

        scrollbar = ttk.Scrollbar(
            table_frame, orient=tk.VERTICAL, command=self.tree.yview
        )
        self.tree.configure(yscrollcommand=scrollbar.set)

        self.tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

        button_frame = ttk.Frame(main_container)
        button_frame.pack(fill=tk.X)

        ttk.Button(
            button_frame, text="+ Thêm chuyển đổi", command=self.addMapping, width=20
        ).pack(side=tk.LEFT, padx=(0, 10))

        ttk.Button(
            button_frame,
            text="Thay đổi đầu vào",
            command=self.changeInputKey,
            width=20,
        ).pack(side=tk.LEFT, padx=(0, 10))

        ttk.Button(
            button_frame,
            text="Thay đổi đầu ra",
            command=self.changeOutputKey,
            width=20,
        ).pack(side=tk.LEFT, padx=(0, 10))

        ttk.Button(
            button_frame, text="Xóa chuyển đổi", command=self.deleteMapping, width=20
        ).pack(side=tk.LEFT)

        self.updateTable()

    def loadMappings(self):
        if os.path.exists(self.config_file):
            try:
                with open(self.config_file, "r") as f:
                    self.mappings = json.load(f)
            except Exception as e:
                messagebox.showerror("Lỗi", f"Không thể tải cấu hình: {e}")
                self.mappings = {}
        else:
            self.mappings = {}

    def save_mappings(self):
        try:
            with open(self.config_file, "w") as f:
                json.dump(self.mappings, f, indent=4)
        except Exception as e:
            messagebox.showerror("Lỗi", f"Không thể lưu cấu hình: {e}")

    def updateTable(self):
        current_selection = self.tree.selection()
        selected_values = None
        if current_selection:
            item = self.tree.item(current_selection[0])
            selected_values = item["values"]

        for item in self.tree.get_children():
            self.tree.delete(item)

        new_selection = None
        for from_key, to_key in self.mappings.items():
            item_id = self.tree.insert(
                "",
                tk.END,
                values=(
                    from_key.replace("+", " + ").upper(),
                    to_key.replace("+", " + ").upper(),
                ),
            )

            if (
                selected_values
                and selected_values[0] == from_key.replace("+", " + ").upper()
            ):
                new_selection = item_id

        if new_selection:
            self.tree.selection_set(new_selection)
            self.tree.focus(new_selection)

        self.tree.update_idletasks()

    def addMapping(self):
        # Nhập đầu vào
        from_dialog = KeyCaptureDialog(self.root, "Nhập phím đầu vào", self.mappings)
        self.root.wait_window(from_dialog.dialog)
        from_key = from_dialog.result

        if not from_key:
            return

        # Kiểm tra phím đã tồn tại
        if from_key in self.mappings:
            response = messagebox.askyesno(
                "Phím trùng lặp",
                f"Phím '{from_key.replace('+', ' + ').upper()}' đã được chuyển đổi thành '{self.mappings[from_key].replace('+', ' + ').upper()}'.\n\nBạn có muốn cập nhật không?",
                icon="warning",
            )
            if not response:
                return

        # Nhập đầu ra
        to_dialog = KeyCaptureDialog(self.root, "Nhập phím đầu ra")
        self.root.wait_window(to_dialog.dialog)
        to_key = to_dialog.result

        if not to_key:
            return

        self.mappings[from_key] = to_key
        self.save_mappings()
        self.updateTable()

        if self.remapper_active:
            self.applyMappings()

    def changeInputKey(self):
        selection = self.tree.selection()
        if not selection:
            messagebox.showinfo("Thông tin", "Chọn chuyển đổi để chỉnh sửa.")
            return

        item = self.tree.item(selection[0])
        old_from_key_display = item["values"][0]

        actual_from_key = None
        for key in self.mappings:
            if key.replace("+", " + ").upper() == old_from_key_display:
                actual_from_key = key
                break

        if not actual_from_key:
            return

        from_dialog = KeyCaptureDialog(
            self.root, "Nhập phím đầu vào mới", self.mappings
        )
        self.root.wait_window(from_dialog.dialog)
        new_from_key = from_dialog.result

        if not new_from_key:
            return

        if new_from_key in self.mappings and new_from_key != actual_from_key:
            response = messagebox.askyesno(
                "Phím đã tồn tại",
                f"Phím '{new_from_key.replace('+', ' + ').upper()}' đã được chuyển đổi thành '{self.mappings[new_from_key].replace('+', ' + ').upper()}'.\n\nBạn có muốn cập nhật không?",
                icon="warning",
            )
            if not response:
                return

            del self.mappings[new_from_key]

        to_key = self.mappings[actual_from_key]
        del self.mappings[actual_from_key]
        self.mappings[new_from_key] = to_key

        self.save_mappings()
        self.updateTable()

        if self.remapper_active:
            self.applyMappings()

    def changeOutputKey(self):
        selection = self.tree.selection()
        if not selection:
            messagebox.showinfo("Thông tin", "Chọn chuyển đổi để chỉnh sửa.")
            return

        item = self.tree.item(selection[0])
        from_key_display = item["values"][0]

        actual_from_key = None
        for key in self.mappings:
            if key.replace("+", " + ").upper() == from_key_display:
                actual_from_key = key
                break

        if not actual_from_key:
            return

        to_dialog = KeyCaptureDialog(self.root, "Nhập phím đầu ra mới")
        self.root.wait_window(to_dialog.dialog)
        new_to_key = to_dialog.result

        if not new_to_key:
            return

        self.mappings[actual_from_key] = new_to_key
        self.save_mappings()
        self.updateTable()

        if self.remapper_active:
            self.applyMappings()

    def deleteMapping(self):
        selection = self.tree.selection()
        if not selection:
            messagebox.showinfo("Thông tin", "Chọn chuyển đổi để xóa.")
            return

        if not messagebox.askyesno("Confirm", "Xóa chuyển đổi được chọn?"):
            return

        item = self.tree.item(selection[0])
        from_key_display = item["values"][0]

        for key in list(self.mappings.keys()):
            if key.replace("+", " + ").upper() == from_key_display:
                del self.mappings[key]
                break

        self.save_mappings()
        self.updateTable()

        if self.remapper_active:
            self.applyMappings()

    def toggleRemapper(self):
        if self.remapper_active:
            self.disableRemapper()
        else:
            self.enableRemapper()

    def enableRemapper(self):
        if not self.mappings:
            messagebox.showinfo(
                "Info", "Hiện không có chuyển đổi nào. Hãy thêm vào trước."
            )
            return

        self.remapper_active = True
        self.toggle_button.config(text="TẮT")
        self.status_label.config(text="Trạng thái: Đang bật", foreground="#107C10")
        self.applyMappings()

    def disableRemapper(self):
        self.remapper_active = False
        self.toggle_button.config(text="BẬT")
        self.status_label.config(text="Trạng thái: Đang tắt", foreground="#666")
        self.clearHooks()

    def applyMappings(self):
        self.clearHooks()

        for from_key, to_key in self.mappings.items():
            try:
                try:

                    def create_remap_handler(target):
                        def handler(e):
                            if e.event_type == "down":
                                keyboard.press(target)
                            elif e.event_type == "up":
                                keyboard.release(target)
                            return False

                        return handler

                    hook = keyboard.hook_key(
                        from_key, create_remap_handler(to_key), suppress=True
                    )
                    self.active_hooks.append(hook)
                except Exception:
                    hotkey = keyboard.add_hotkey(
                        from_key, lambda: keyboard.send(to_key), suppress=True
                    )
                    self.active_hotkeys.append(hotkey)
            except Exception:
                messagebox.showerror(
                    "Lỗi", f"Không thể chuyển đổi {from_key} -> {to_key}."
                )
                self.disableRemapper()

    def clearHooks(self):
        for hook in self.active_hooks:
            try:
                keyboard.unhook(hook)
            except Exception:
                pass

        for hotkey in self.active_hotkeys:
            try:
                keyboard.clear_hotkey(hotkey)
            except Exception:
                pass
        self.active_hooks.clear()
        self.active_hotkeys.clear()

    def handleClosing(self):
        if self.remapper_active:
            self.disableRemapper()
        keyboard.unhook_all()
        keyboard.clear_all_hotkeys()
        self.root.destroy()
