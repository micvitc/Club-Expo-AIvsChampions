import subprocess
import time
import sys
import webbrowser
import os

class C:
    RESET  = "\033[0m"
    BOLD   = "\033[1m"
    CYAN   = "\033[96m"
    GREEN  = "\033[92m"
    YELLOW = "\033[93m"

def main():
    print(f"{C.CYAN}{C.BOLD}🎮  Initializing Pokémon AI vs Champions...  🎮{C.RESET}\n")
    
    python_bin = "./venv/bin/python" if os.path.exists("./venv/bin/python") else "python"
    
    # 1. Open the browser
    print(f"🌐  Opening battle viewer: {C.CYAN}http://localhost:8000/{C.RESET}")
    webbrowser.open("http://localhost:8000/")
    
    # 2. Start AI.py in the foreground
    print(f"🚀  Starting local Showdown server & opponent AI in the foreground...\n")
    try:
        subprocess.run([python_bin, "AI.py"] + sys.argv[1:])
    except KeyboardInterrupt:
        pass
    finally:
        print(f"\n👋  {C.GREEN}Thanks for playing!{C.RESET}")

if __name__ == "__main__":
    main()
