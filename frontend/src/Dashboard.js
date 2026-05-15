import { useState, useEffect } from "react";
import api from "./api";

export default function Dashboard({ token, logout }) {

  const [priceData, setPriceData] = useState({});
  const [availability, setAvailability] = useState({});
  const [file, setFile] = useState(null);
  const [userName, setUserName] = useState("");
  const [prescriptions, setPrescriptions] = useState([]);

  // =========================
  // Load User + Prescriptions
  // =========================

  useEffect(() => {

    const user =
      JSON.parse(
        localStorage.getItem("user")
      );

    if (user) {
      setUserName(user.name);
    }

    fetchPrescriptions();

  }, []);

  // =========================
  // Fetch Prescriptions
  // =========================

  const fetchPrescriptions = async () => {

    try {

      const res = await api.get(
        "/api/upload/all",
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

      setPrescriptions(
        res.data.data || []
      );

    } catch (error) {

      console.log(error);

    }

  };

  // =========================
  // Upload Prescription
  // =========================

  const upload = async () => {

    try {

      if (!file) {
        return alert("Select file");
      }

      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      await axios.post(
        "/api/upload",
        formData,
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

      alert(
        "Uploaded Successfully ✅"
      );

      fetchPrescriptions();

    } catch (error) {

      console.log(error);

      alert("Upload failed");

    }

  };

  // =========================
  // Check Availability
  // =========================

  const checkAvailability = async (
    medicineName
  ) => {

    try {

      const res = await api.get(

        `/api/upload/medicine-availability?name=${medicineName}`

      );

      setAvailability(prev => ({

        ...prev,

        [medicineName]:
          res.data.available

      }));

    } catch (error) {

      console.log(error);

    }

  };

  // =========================
  // Fetch Price Comparison
  // =========================

  const fetchMedicinePrices = async (
    medicineName
  ) => {

    try {

      const res = await api.get(

        `api/upload/medicine-price?name=${medicineName}`

      );

      setPriceData(prev => ({

        ...prev,

        [medicineName]:
          res.data.prices

      }));

    } catch (error) {

      console.log(error);

    }

  };

  // =========================
  // Auto Load Availability
  // =========================

  useEffect(() => {

    prescriptions.forEach((p) => {

      p.medicines?.forEach((m) => {

        checkAvailability(m.name);

        fetchMedicinePrices(m.name);

      });

    });

  }, [prescriptions]);

  return (

    <div style={styles.container}>

      {/* HEADER */}

      <div style={styles.header}>

        <h2>
          💊 MediCare Dashboard
        </h2>

        <div>

          <span>
            Welcome, {userName}
          </span>

          <button
            style={styles.logout}
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </div>

      {/* QUICK ACTIONS */}

      <div style={styles.cardRow}>

        <div style={styles.card}>

          <h3>
            📤 Upload Prescription
          </h3>

          <input
            type="file"
            onChange={(e) =>
              setFile(
                e.target.files[0]
              )
            }
          />

          <button
            onClick={upload}
            style={styles.btn}
          >
            Upload
          </button>

        </div>

        

      </div>

      {/* PRESCRIPTIONS */}

      <h3>
        📋 Uploaded Prescriptions
      </h3>

      {prescriptions.map((p, i) => (

        <div
          key={i}
          style={styles.prescriptionCard}
        >

          <h4>
            Patient:
            {" "}
            {p.patientName}
          </h4>

          <p>
            Doctor:
            {" "}
            {p.doctorName}
          </p>

          <p>
            Hospital:
            {" "}
            {p.hospitalName}
          </p>

          <h4>
            Medicines
          </h4>

          {p.medicines?.map((m, idx) => (

            <div
              key={idx}
              style={styles.medicineCard}
            >

              <h4>
                💊 {m.name}
              </h4>

              <p>
                Dosage:
                {" "}
                {m.dosage || "N/A"}
              </p>

              <p>
                Timing:
                {" "}
                {m.timing || "N/A"}
              </p>

              {/* Reminder */}

              <h4>
                Set Reminder
              </h4>

              <select

                value={
                  m.reminderType || ""
                }

                onChange={async (e) => {

                  const type =
                    e.target.value;

                  if (!type) return;

                  const today =
                    new Date();

                  let nextReminderDate =
                    new Date();

                  // Weekly

                  if (
                    type === "weekly"
                  ) {

                    nextReminderDate
                      .setDate(
                        today.getDate() + 7
                      );

                  }

                  // 15 Days

                  if (
                    type === "15days"
                  ) {

                    nextReminderDate
                      .setDate(
                        today.getDate() + 15
                      );

                  }

                  // Monthly

                  if (
                    type === "monthly"
                  ) {

                    nextReminderDate
                      .setMonth(
                        today.getMonth() + 1
                      );

                  }

                  const formattedDate =
                    nextReminderDate
                      .toISOString()
                      .split("T")[0];

                  try {

                    await axios.put(

                      `/api/upload/reminder/${p._id}/${idx}`,

                      {

                        reminderType:
                          type,

                        nextReminderDate:
                          formattedDate

                      }

                    );

                    alert(
                      `Reminder saved for ${m.name}`
                    );

                    fetchPrescriptions();

                  } catch (error) {

                    console.log(error);

                    alert(
                      "Failed to save reminder"
                    );

                  }

                }}

              >

                <option value="">
                  Select Reminder
                </option>

                <option value="weekly">
                  Weekly
                </option>

                <option value="15days">
                  Every 15 Days
                </option>

                <option value="monthly">
                  Monthly
                </option>

              </select>

              {/* Reminder Details */}

              {m.reminderType && (

                <div style={styles.reminderBox}>

                  

                  {/* PRICE COMPARISON */}

                  {priceData[m.name] && (

                    <div
                      style={
                        styles.priceBox
                      }
                    >

                      <h4>
                        Price Comparison
                      </h4>

                      <p>
                        Tata 1mg:
                        {" "}
                        ₹
                        {
                          priceData[
                            m.name
                          ].tata1mg.price
                        }
                        {" "}
                        {
                          priceData[
                            m.name
                          ].tata1mg.stock
                            ? "✅"
                            : "❌"
                        }
                      </p>

                      <p>
                        PharmEasy:
                        {" "}
                        ₹
                        {
                          priceData[
                            m.name
                          ].pharmeasy.price
                        }
                        {" "}
                        {
                          priceData[
                            m.name
                          ].pharmeasy.stock
                            ? "✅"
                            : "❌"
                        }
                      </p>

                      <p>
                        Netmeds:
                        {" "}
                        ₹
                        {
                          priceData[
                            m.name
                          ].netmeds.price
                        }
                        {" "}
                        {
                          priceData[
                            m.name
                          ].netmeds.stock
                            ? "✅"
                            : "❌"
                        }
                      </p>

                      <p>
                        Truemeds:
                        {" "}
                        ₹
                        {
                          priceData[
                            m.name
                          ].truemeds.price
                        }
                        {" "}
                        {
                          priceData[
                            m.name
                          ].truemeds.stock
                            ? "✅"
                            : "❌"
                        }
                      </p>

                    </div>

                  )}

                  <p>

                    <strong>
                      Reminder Type:
                    </strong>

                    {" "}

                    {m.reminderType === "weekly"
                      ? "Weekly"
                      : m.reminderType === "15days"
                      ? "Every 15 Days"
                      : "Monthly"}

                  </p>

                  <p>

                    <strong>
                      Next Reminder:
                    </strong>

                    {" "}
                    {m.nextReminderDate}

                  </p>

                </div>

              )}

              {/* BUY BUTTONS */}

              <div style={styles.buyRow}>

  <a
    href={`https://www.1mg.com/search/all?name=${m.name}`}
    target="_blank"
    rel="noreferrer"
    style={styles.buyBtn}
  >
    🛒 Tata 1mg
  </a>

  <a
    href={`https://pharmeasy.in/search/all?name=${m.name}`}
    target="_blank"
    rel="noreferrer"
    style={styles.buyBtn}
  >
    💊 PharmEasy
  </a>

  <a
    href={`https://www.netmeds.com/catalogsearch/result/${m.name}`}
    target="_blank"
    rel="noreferrer"
    style={styles.buyBtn}
  >
    🏥 Netmeds
  </a>

  <a
    href={`https://www.truemeds.in/search/${m.name}`}
    target="_blank"
    rel="noreferrer"
    style={styles.buyBtn}
  >
    ✅ Truemeds
  </a>

</div>

            </div>

          ))}

        </div>

      ))}

    </div>

  );

}

/* STYLES */

const styles = {

  container: {
  padding: 20,
  fontFamily: "Arial",
  background: "#f3f4f6",
  minHeight: "100vh"
},

  header: {

    display: "flex",

    justifyContent:
      "space-between",

    alignItems: "center",

    marginBottom: 20

  },

  logout: {

    marginLeft: 10,

    padding: "5px 10px"

  },

  cardRow: {

    display: "flex",

    gap: 20,

    marginBottom: 20

  },

  card: {

    flex: 1,

    padding: 15,

    border: "1px solid #ddd",

    borderRadius: 10

  },

  btn: {

    marginTop: 10,

    padding: "8px 12px",

    background: "#007bff",

    color: "white",

    border: "none",

    borderRadius: 5

  },

  prescriptionCard: {

    border: "1px solid #ccc",

    padding: 15,

    marginBottom: 15,

    borderRadius: 10

  },

  medicineCard: {

    border: "1px solid #eee",

    padding: 15,

    marginTop: 10,

    borderRadius: 8

  },


    reminderBox: {
  marginTop: 15,
  padding: 15,
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  display: "flex",
  flexDirection: "column",
  gap: 10
},

 priceBox: {
  marginTop: 10,
  padding: 12,
  background: "#f9fafb",
  border: "1px solid #dbeafe",
  borderRadius: 10
},

  buyRow: {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  marginTop: 15
},

buyBtn: {
  padding: "8px 14px",
  background: "#2563eb",
  color: "white",
  textDecoration: "none",
  borderRadius: 8,
  fontSize: 14,
  fontWeight: "bold"
},

};