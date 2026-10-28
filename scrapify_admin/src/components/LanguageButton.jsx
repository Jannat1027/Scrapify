import { isBanglaMode, toggleLanguage } from "../utils/translate.js";

// Switches the whole site between English and বাংলা.
export default function LanguageButton({ className = "" }) {
  return (
    <button type="button" className={`btn btn-sm ${className}`} onClick={toggleLanguage}>
      {isBanglaMode() ? "English" : "বাংলা"}
    </button>
  );
}
