const HG_ADMIN_AUTH = {
  storageKey: "hg_admin_unlocked",
  passcode: "henggou-admin",

  isUnlocked() {
    return sessionStorage.getItem(this.storageKey) === "yes";
  },

  unlock() {
    sessionStorage.setItem(this.storageKey, "yes");
  },

  lock() {
    sessionStorage.removeItem(this.storageKey);
  }
};

function initAdminGate() {
  const gate = document.getElementById("adminGate");
  const form = document.getElementById("adminGateForm");
  const input = document.getElementById("adminPasscode");

  if (!gate || !form || !input) return;

  if (HG_ADMIN_AUTH.isUnlocked()) {
    gate.classList.add("hidden");
  }

  form.addEventListener("submit", event => {
    event.preventDefault();

    if (input.value === HG_ADMIN_AUTH.passcode) {
      HG_ADMIN_AUTH.unlock();
      gate.classList.add("hidden");
      input.value = "";
    } else {
      alert("密碼錯誤");
    }
  });
}

document.addEventListener("DOMContentLoaded", initAdminGate);
