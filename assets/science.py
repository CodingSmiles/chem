import tkinter as tk
from tkinter import ttk
import random
import re

ions = {

    "Sodium": ("Na", "+1"),
    "Potassium": ("K", "+1"),
    "Silver": ("Ag", "+1"),
    "Hydrogen": ("H", "+1"),
    "Ammonium": ("NH4", "+1"),
    "Copper (I)": ("Cu", "+1"),

    "Magnesium": ("Mg", "+2"),
    "Calcium": ("Ca", "+2"),
    "Zinc": ("Zn", "+2"),
    "Iron (II) (Ferrous)": ("Fe", "+2"),
    "Copper (II)": ("Cu", "+2"),
    "Lead (II)": ("Pb", "+2"),
    "Barium": ("Ba", "+2"),

    "Aluminium": ("Al", "+3"),
    "Iron (III) (Ferric)": ("Fe", "+3"),

    "Hydride": ("H", "-1"),
    "Chloride": ("Cl", "-1"),
    "Bromide": ("Br", "-1"),
    "Iodide": ("I", "-1"),
    "Hydroxide": ("OH", "-1"),
    "Nitrate": ("NO3", "-1"),
    "Hydrogen carbonate (Bicarbonate)": ("HCO3", "-1"),

    "Oxide": ("O", "-2"),
    "Sulphide": ("S", "-2"),
    "Carbonate": ("CO3", "-2"),
    "Sulphite": ("SO3", "-2"),
    "Sulphate": ("SO4", "-2"),

    "Nitride": ("N", "-3"),
    "Phosphate": ("PO4", "-3"),
}

compounds = {

    "Hydrochloric acid": "HCl",
    "Sulphuric acid": "H2SO4",
    "Nitric acid": "HNO3",
    "Carbonic acid": "H2CO3",
    "Phosphoric acid": "H3PO4",
    "Acetic acid": "CH3COOH",

    "Sodium hydroxide": "NaOH",
    "Potassium hydroxide": "KOH",
    "Calcium hydroxide (Slaked lime)": "Ca(OH)2",
    "Ammonium hydroxide": "NH4OH",

    "Sodium chloride (Common salt)": "NaCl",
    "Baking soda": "NaHCO3",
    "Washing soda": "Na2CO3.10H2O",
    "Bleaching powder": "CaOCl2",
    "Plaster of Paris": "CaSO4.1/2H2O",
    "Gypsum": "CaSO4.2H2O",
    "Quicklime": "CaO",
    "Lime water": "Ca(OH)2",
    "Ammonium chloride": "NH4Cl",
    "Copper sulphate": "CuSO4",
    "Ferrous sulphate": "FeSO4",
    "Zinc sulphate": "ZnSO4",
    "Copper sulphate (with water crystallization)": "CuSO4.5H2O",
    "Ferrous sulphate (with water crystallization)": "FeSO4.7H2O",
    "Zinc sulphate (with water crystallization)": "ZnSO4.7H2O"
}

def normalize_compound(text: str) -> str:
    return re.sub(r'\s+', '', text).lower()

def parse_ion_answer(text: str):
    if not text:
        return None
    t = text.strip()

    t = t.replace('(', '').replace(')', '').replace(',', ' ')

    t = re.sub(r'\s+', ' ', t).strip()

    parts = t.split(' ')

    if len(parts) == 1:
        s = parts[0]
        m = re.match(r'^([A-Za-z]{1,2})([+-]?\d+)$', s)
        if m:
            sym = m.group(1).capitalize()
            val = m.group(2)
            if not val.startswith(('+', '-')):
                val = '+' + val
            return sym, val
        else:
            return None

    else:
        sym = parts[0].capitalize()
        val_part = parts[1]
        m2 = re.search(r'([+-]?\d+)', val_part)
        if not m2:
            return None
        val = m2.group(1)
        if not val.startswith(('+', '-')):
            val = '+' + val
        return sym, val

class QuizApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Chemistry Quiz")
        self.root.geometry("950x750")
        self.root.configure(bg="#eef3f9")

        style = ttk.Style()
        style.configure("TLabel", font=("Segoe UI", 14), background="#eef3f9")
        style.configure("TButton", font=("Segoe UI", 13, "bold"), padding=8)
        style.configure("TEntry", font=("Segoe UI", 16))

        self.question_pool = [("ion", name) for name in ions.keys()] + \
                             [("compound", name) for name in compounds.keys()]
        random.shuffle(self.question_pool)

        self.current_index = 0
        self.score = 0
        self.streak = 0
        self.max_streak = 0
        self.wrong_answers = []

        self.label_title = ttk.Label(root, text="⚛ Chemistry Quiz ⚛", font=("Segoe UI", 26, "bold"))
        self.label_title.pack(pady=20)

        self.label_instruction = ttk.Label(
            root,
            text="Answer format:\nFor Ions → (Symbol, Valency). Examples:\n  Na,+1   OR   Na +1   OR   Na+1\nFor Compounds → Formula only (e.g., CaO)",
            font=("Segoe UI", 14), foreground="#333", justify="center"
        )
        self.label_instruction.pack(pady=10)

        self.label_question = ttk.Label(root, text="", font=("Segoe UI", 20, "bold"), anchor="center")
        self.label_question.pack(pady=30)

        self.entry_answer = ttk.Entry(root, width=40, justify="center", font=("Segoe UI", 18))
        self.entry_answer.pack(pady=15, ipady=8)
        self.entry_answer.bind("<Return>", lambda event: self.check_answer())

        self.button_submit = ttk.Button(root, text="Submit Answer", command=self.check_answer)
        self.button_submit.pack(pady=10)

        self.label_feedback = ttk.Label(root, text="", font=("Segoe UI", 16), wraplength=700, justify="center")
        self.label_feedback.pack(pady=15)

        self.label_score = ttk.Label(root, text="Score: 0", font=("Segoe UI", 14, "bold"), foreground="#006400")
        self.label_score.pack()
        self.label_streak = ttk.Label(root, text="🔥 Streak: 0", font=("Segoe UI", 14), foreground="#b22222")
        self.label_streak.pack()

        self.label_progress = ttk.Label(root, text="Question 0/0", font=("Segoe UI", 14))
        self.label_progress.pack(pady=5)

        self.result_frame = tk.Frame(root, bg="#eef3f9")

        self.show_question()

    def show_question(self):
        if self.current_index < len(self.question_pool):
            qtype, name = self.question_pool[self.current_index]
            self.label_question.config(text=f"Q{self.current_index+1}: {name}")
            self.entry_answer.delete(0, tk.END)
            self.label_feedback.config(text="")
            self.label_progress.config(text=f"Question {self.current_index+1}/{len(self.question_pool)}")
        else:
            self.end_quiz()

    def check_answer(self):
        if self.current_index >= len(self.question_pool):
            return

        qtype, name = self.question_pool[self.current_index]
        user_answer = self.entry_answer.get().strip()

        if qtype == "ion":
            correct_symbol, correct_valency = ions[name]

            parsed = parse_ion_answer(user_answer)
            is_correct = False
            if parsed:
                user_sym, user_val = parsed
                try:
                    if user_sym.lower() == correct_symbol.lower() and int(user_val) == int(correct_valency):
                        is_correct = True
                except ValueError:
                    is_correct = False

            if is_correct:
                self.feedback(True, f"{correct_symbol},{correct_valency}")
            else:
                self.feedback(False, f"{correct_symbol},{correct_valency}", user_answer, name)

        elif qtype == "compound":
            correct_formula = next(iter([compounds[name]]), None) if compounds else None

            if correct_formula and normalize_compound(user_answer) == normalize_compound(correct_formula):
                self.feedback(True, correct_formula)
            else:

                if correct_formula:
                    self.feedback(False, correct_formula, user_answer, name)
                else:

                    self.feedback(True, "")

        self.current_index += 1
        self.root.after(800, self.show_question)

    def feedback(self, is_correct, correct_answer, user_answer=None, qname=None):
        if is_correct:
            emojis = ["✅ Correct!", "🎉 Well done!", "⭐ Right answer!", "👏 Nice!"]
            self.label_feedback.config(text=random.choice(emojis), foreground="green")
            self.score += 1
            self.streak += 1
            self.max_streak = max(self.max_streak, self.streak)
        else:
            display_correct = correct_answer if correct_answer else "—"
            self.label_feedback.config(text=f"❌ Wrong!\nCorrect: {display_correct}", foreground="red")
            self.streak = 0
            if qname:
                self.wrong_answers.append((qname, user_answer if user_answer else "⟨blank⟩", display_correct))

        self.label_score.config(text=f"Score: {self.score}")
        self.label_streak.config(text=f"🔥 Streak: {self.streak}")

    def end_quiz(self):

        self.label_question.pack_forget()
        self.entry_answer.pack_forget()
        self.button_submit.pack_forget()
        self.label_feedback.pack_forget()
        self.label_progress.pack_forget()
        self.label_streak.pack_forget()

        self.result_frame.pack(fill="both", expand=True, pady=20)

        final_score = ttk.Label(
            self.result_frame,
            text=f"🏆 Final Score: {self.score}/{len(self.question_pool)}\n🔥 Best Streak: {self.max_streak}",
            font=("Segoe UI", 20, "bold"),
            background="#eef3f9",
            foreground="#003366",
            justify="center"
        )
        final_score.pack(pady=20)

        if self.wrong_answers:
            wrong_title = ttk.Label(
                self.result_frame,
                text="Review of Wrong Answers:",
                font=("Segoe UI", 16, "bold"),
                background="#eef3f9"
            )
            wrong_title.pack(pady=10)

            frame_tb = tk.Frame(self.result_frame, bg="#eef3f9")
            frame_tb.pack(fill="both", expand=True, padx=20, pady=10)
            text_box = tk.Text(frame_tb, wrap="word", font=("Segoe UI", 14), height=15, width=80)
            text_box.pack(side="left", fill="both", expand=True)
            scrollbar = ttk.Scrollbar(frame_tb, command=text_box.yview)
            scrollbar.pack(side="right", fill="y")
            text_box.configure(yscrollcommand=scrollbar.set)

            for q, user, correct in self.wrong_answers:
                text_box.insert("end", f"• {q}\n   You wrote: {user}\n   Correct: {correct}\n\n")

            text_box.config(state="disabled")

if __name__ == "__main__":
    root = tk.Tk()
    app = QuizApp(root)
    root.mainloop()
