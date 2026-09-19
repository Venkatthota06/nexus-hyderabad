"use client";

import {
  CheckCircle2,
  RotateCcw,
  Save,
  SlidersHorizontal,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

type Preferences = {
  compactTables: boolean;
  followUpReminders: boolean;
  leadAlerts: boolean;
  rememberFilters: boolean;
  defaultLandingPage: string;
};

const STORAGE_KEY =
  "nexus-hyderabad-crm-preferences";

const defaults: Preferences = {
  compactTables: false,
  followUpReminders: true,
  leadAlerts: true,
  rememberFilters: true,
  defaultLandingPage: "/admin",
};

export default function SettingsPreferences() {
  const [
    preferences,
    setPreferences,
  ] = useState<Preferences>(defaults);

  const [
    saved,
    setSaved,
  ] = useState(false);

  useEffect(() => {
    try {
      const stored =
        window.localStorage.getItem(
          STORAGE_KEY
        );

      if (!stored) return;

      const parsed =
        JSON.parse(stored);

      setPreferences({
        ...defaults,
        ...parsed,
      });
    } catch (error) {
      console.error(
        "Load CRM preferences error:",
        error
      );
    }
  }, []);

  function update(
    key: keyof Preferences,
    value: boolean | string
  ) {
    setPreferences((current) => ({
      ...current,
      [key]: value,
    }));

    setSaved(false);
  }

  function savePreferences() {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(preferences)
    );

    setSaved(true);

    window.setTimeout(
      () => setSaved(false),
      1800
    );
  }

  function resetPreferences() {
    setPreferences(defaults);

    window.localStorage.removeItem(
      STORAGE_KEY
    );

    setSaved(true);

    window.setTimeout(
      () => setSaved(false),
      1800
    );
  }

  return (
    <section className="settings-preferences-card">
      <div className="settings-card-head">
        <div className="settings-card-icon cyan">
          <SlidersHorizontal size={18} />
        </div>

        <div>
          <span>USER PREFERENCES</span>
          <h2>Workspace Preferences</h2>
          <p>
            These settings are saved in this browser only and do not
            change CRM business records.
          </p>
        </div>
      </div>

      <div className="settings-preferences-grid">
        <PreferenceToggle
          label="Lead Alerts"
          description="Keep new-lead visual alerts enabled."
          checked={preferences.leadAlerts}
          onChange={(checked) =>
            update(
              "leadAlerts",
              checked
            )
          }
        />

        <PreferenceToggle
          label="Follow-up Reminders"
          description="Keep upcoming follow-up reminders enabled."
          checked={
            preferences.followUpReminders
          }
          onChange={(checked) =>
            update(
              "followUpReminders",
              checked
            )
          }
        />

        <PreferenceToggle
          label="Remember Filters"
          description="Retain preferred list filtering behaviour."
          checked={
            preferences.rememberFilters
          }
          onChange={(checked) =>
            update(
              "rememberFilters",
              checked
            )
          }
        />

        <PreferenceToggle
          label="Compact Tables"
          description="Prefer tighter data-table spacing."
          checked={
            preferences.compactTables
          }
          onChange={(checked) =>
            update(
              "compactTables",
              checked
            )
          }
        />

        <label className="settings-select-field">
          <span>Default CRM Landing Page</span>

          <select
            value={
              preferences.defaultLandingPage
            }
            onChange={(event) =>
              update(
                "defaultLandingPage",
                event.target.value
              )
            }
          >
            <option value="/admin">
              Dashboard
            </option>

            <option value="/admin/companies">
              Clients
            </option>

            <option value="/admin/leads">
              Lead Management
            </option>

            <option value="/admin/follow-ups">
              Follow-ups
            </option>

            <option value="/admin/monthly-plan">
              Monthly Plan
            </option>
          </select>
        </label>
      </div>

      <div className="settings-preferences-actions">
        <button
          type="button"
          className="settings-reset-button"
          onClick={resetPreferences}
        >
          <RotateCcw size={15} />
          Reset
        </button>

        <button
          type="button"
          className="settings-save-button"
          onClick={savePreferences}
        >
          {saved ? (
            <CheckCircle2 size={15} />
          ) : (
            <Save size={15} />
          )}

          {saved
            ? "Saved"
            : "Save Preferences"}
        </button>
      </div>
    </section>
  );
}

function PreferenceToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="settings-toggle-row">
      <div>
        <strong>{label}</strong>
        <span>{description}</span>
      </div>

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          onChange(event.target.checked)
        }
      />

      <i />
    </label>
  );
}
