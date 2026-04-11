import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { useRef } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function ClassTime() {
  const calendarRef = useRef(null);
  const [trainerId, setTrainerId] = useState("");
  const [trainerName, setTrainerName] = useState("");
  const [students, setStudents] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [view, setView] = useState("timeGridDay");

  const [loadingCategories, setLoadingCategories] = useState(true);
  const categories = [
    "Martial Arts",
    "Team Ball Sports",
    "Racket Sports",
    "Fitness",
    "Target & Precision Sports",
    "Equestrian Sports",
    "Adventure & Outdoor Sports",
    "Ice Sports",
    "Aquatic Sports",
    "Wellness",
    "Dance",
  ];

  const subCategoryMap = {
    "Martial Arts": [
      "Karate",
      "Kung Fu",
      "Krav Maga",
      "Muay Thai",
      "Taekwondo",
      "Judo",
      "Brazilian Jiu-Jitsu",
      "Aikido",
      "Jeet Kune Do",
      "Capoeira",
      "Sambo",
      "Silat",
      "Kalaripayattu",
      "Hapkido",
      "Wing Chun",
      "Shaolin",
      "Ninjutsu",
      "Kickboxing",
      "Boxing",
      "Wrestling",
      "Shorinji Kempo",
      "Kyokushin",
      "Goju-ryu",
      "Shotokan",
      "Wushu",
      "Savate",
      "Lethwei",
      "Bajiquan",
      "Hung Gar",
      "Praying Mantis Kung Fu",
    ],
    "Team Ball Sports": [
      "Football / Soccer",
      "Basketball",
      "Handball",
      "Rugby",
      "Futsal",
      "Field Hockey",
      "Lacrosse",
      "Gaelic Football",
      "Volleyball",
      "Beach Volleyball",
      "Sepak Takraw",
      "Roundnet (Spikeball)",
      "Netball",
      "Cricket",
      "Baseball",
      "Softball",
      "Wheelchair Rugby",
      "Dodgeball",
      "Korfball",
    ],
    "Racket Sports": [
      "Tennis",
      "Table Tennis",
      "Badminton",
      "Squash",
      "Racquetball",
      "Padel",
      "Pickleball",
      "Platform Tennis",
      "Real Tennis",
      "Soft Tennis",
      "Frontenis",
      "Speedminton (Crossminton)",
      "Paddle Tennis (POP Tennis)",
      "Speed-ball",
      "Chaza",
      "Totem Tennis (Swingball)",
      "Matkot",
      "Jombola",
    ],
    Fitness: [
      "Gym Workout",
      "Weight Training",
      "Bodybuilding",
      "Powerlifting",
      "CrossFit",
      "Calisthenics",
      "Circuit Training",
      "HIIT",
      "Functional Training",
      "Core Training",
      "Mobility Training",
      "Stretching",
      "Resistance Band Training",
      "Kettlebell Training",
      "Boot Camp Training",
      "Spinning",
      "Step Fitness",
      "Pilates",
      "Yoga",
    ],
    "Target & Precision Sports": [
      "Archery",
      "Golf",
      "Bowling",
      "Darts",
      "Snooker",
      "Pool",
      "Billiards",
      "Target Shooting",
      "Clay Pigeon Shooting",
      "Air Rifle Shooting",
      "Air Pistol Shooting",
      "Croquet",
      "Petanque",
      "Bocce",
      "Lawn Bowls",
      "Carom Billiards",
      "Nine-Pin Bowling",
      "Disc Golf",
      "Kubb",
      "Pitch and Putt",
      "Shove Ha’penny",
      "Toad in the Hole",
      "Bat and Trap",
      "Boccia",
      "Gateball",
    ],
    "Equestrian Sports": [
      "Horse Racing",
      "Barrel Racing",
      "Rodeo",
      "Mounted Archery",
      "Tent Pegging",
    ],
    "Adventure & Outdoor Sports": [
      "Rock Climbing",
      "Mountaineering",
      "Trekking",
      "Hiking",
      "Mountain Biking",
      "Sandboarding",
      "Orienteering",
      "Obstacle Course Racing",
      "Skydiving",
      "Paragliding",
      "Hang Gliding",
      "Parachuting",
      "Hot-air Ballooning",
      "Skiing",
      "Snowboarding",
      "Ice Climbing",
      "Heli-skiing",
      "Bungee Jumping",
      "BASE Jumping",
      "Canyoning",
      "Kite Buggy",
      "Zorbing",
      "Zip Lining",
    ],
    "Aquatic Sports": [
      "Swimming",
      "Water Polo",
      "Surfing",
      "Scuba Diving",
      "Snorkeling",
      "Freediving",
      "Kayaking",
      "Canoeing",
      "Rowing",
      "Sailing",
      "Windsurfing",
      "Kite Surfing",
      "Jet Skiing",
      "Wakeboarding",
      "Water Skiing",
      "Stand-up Paddleboarding",
      "Whitewater Rafting",
      "Dragon Boat Racing",
      "Artistic Swimming",
      "Open Water Swimming",
    ],
    "Ice Sports": [
      "Ice Skating",
      "Figure Skating",
      "Ice Hockey",
      "Speed Skating",
      "Ice Dance",
      "Synchronized Skating",
      "Curling",
      "Broomball",
      "Bobsleigh",
      "Skiboarding",
      "Ice Dragon Boat Racing",
      "Ice Cross Downhill",
    ],
    Wellness: [
      "Yoga & Meditation",
      "Spa & Relaxation",
      "Mental Wellness",
      "Fitness",
      "Nutrition",
      "Traditional & Alternative Therapies",
      "Rehabilitation",
      "Lifestyle Coaching",
    ],
    Dance: [
      "Bharatanatyam",
      "Kathak",
      "Kathakali",
      "Kuchipudi",
      "Odissi",
      "Mohiniyattam",
      "Manipuri",
      "Sattriya",
      "Chhau",
      "Yakshagana",
      "Lavani",
      "Ghoomar",
      "Kalbelia",
      "Garba",
      "Dandiya Raas",
      "Bhangra",
      "Bihu",
      "Dollu Kunitha",
      "Theyyam",
      "Ballet",
      "Contemporary",
      "Hip Hop",
      "Breakdance",
      "Jazz Dance",
      "Tap Dance",
      "Modern Dance",
      "Street Dance",
      "House Dance",
      "Locking",
      "Popping",
      "Krumping",
      "Waacking",
      "Voguing",
      "Salsa",
      "Bachata",
      "Merengue",
      "Cha-Cha",
      "Rumba",
      "Samba",
      "Paso Doble",
      "Jive",
      "Tango",
      "Waltz",
      "Foxtrot",
      "Quickstep",
      "Flamenco",
      "Irish Stepdance",
      "Scottish Highland Dance",
      "Morris Dance",
      "Hula",
      "Maori Haka",
      "African Tribal Dance",
      "Zumba",
      "K-Pop Dance",
      "Shuffle Dance",
      "Electro Dance",
      "Pole Dance",
      "Ballroom Dance",
      "Line Dance",
      "Square Dance",
      "Folk Dance",
      "Contra Dance",
    ],
  };
  const [form, setForm] = useState({
    date: "",
    startTime: "",
    endTime: "",
    category: "",
    subCategory: "",
    students: [],
  });

  const isEdit = !!editId;

  /* ---------------- AUTH ---------------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) setTrainerId(user.uid);
    });
    return () => unsub();
  }, []);

  /* ---------------- LOAD DATA ---------------- */
  useEffect(() => {
    if (!trainerId) return;

    const loadData = async () => {
      try {
        /* -------- TRAINER DETAILS -------- */
        const trainerDoc = await getDoc(doc(db, "trainers", trainerId));
        const trainerData = trainerDoc.data();

        setTrainerName(trainerData?.firstName || "");

        /* -------- GET CORRECT INSTITUTE -------- */
        const instituteId = trainerData?.instituteId;

        if (instituteId) {
          const instituteDoc = await getDoc(doc(db, "institutes", instituteId));

          const instituteData = instituteDoc.data();

          setCategoriesMap(instituteData?.categories || {});
        } else {
          console.warn("No instituteId found in trainer");
        }

        setLoadingCategories(false);

        /* -------- TRAINER STUDENTS -------- */
        const studentSnap = await getDocs(collection(db, "trainerstudents"));

        const studentList = studentSnap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((s) => s.trainerId === trainerId);

        setStudents(studentList);

        /* -------- TIMETABLE -------- */
        const timetableSnap = await getDocs(
          collection(db, "trainers", trainerId, "timetable"),
        );

        setSchedule(
          timetableSnap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })),
        );
      } catch (err) {
        console.error("Error loading:", err);
        setLoadingCategories(false);
      }
    };

    loadData();
  }, [trainerId]);

  /* ---------------- AUTO SELECT STUDENTS ---------------- */
  useEffect(() => {
    if (students.length > 0 && !editId) {
      const allIds = students.map((s) => s.id);

      setForm((prev) => ({
        ...prev,
        students: allIds,
      }));
    }
  }, [students]);

  /* ---------------- SAVE ---------------- */
  const saveClass = async () => {
    if (!form.category || !form.subCategory) {
      alert("Please fill all fields");
      return;
    }

    const startDateTime = new Date(`${form.date}T${form.startTime}`);
    const endDateTime = new Date(`${form.date}T${form.endTime}`);
    const payload = {
      title: form.subCategory,
      category: form.category,
      subCategory: form.subCategory,
      start: startDateTime,
      end: endDateTime,
      trainerId,
      trainerName,
      students: form.students,
      updatedAt: serverTimestamp(),
    };

    try {
      if (editId) {
        await updateDoc(
          doc(db, "trainers", trainerId, "timetable", editId),
          payload,
        );

        setSchedule((prev) =>
          prev.map((item) =>
            item.id === editId ? { ...item, ...payload } : item,
          ),
        );
      } else {
        const docRef = await addDoc(
          collection(db, "trainers", trainerId, "timetable"),
          {
            ...payload,
            createdAt: serverTimestamp(),
          },
        );

        setSchedule((prev) => [...prev, { id: docRef.id, ...payload }]);
      }

      setShowModal(false);
      setEditId(null);
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  /* ---------------- EVENTS ---------------- */
  const events = schedule.map((s) => ({
    id: s.id,
    title: s.title,
    start: s.start?.toDate ? s.start.toDate() : new Date(s.start),
    end: s.end?.toDate ? s.end.toDate() : new Date(s.end),
  }));
  console.log("EVENTS:", events);
  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* RIGHT CONTENT */}
      <div className="flex-1 p-3 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">

          {/* LEFT CONTROLS */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              className="border rounded px-2 py-1 text-sm"
              value={view}
              onChange={(e) => {
                const newView = e.target.value;
                setView(newView);

                const calendarApi = calendarRef.current.getApi();
                calendarApi.changeView(newView);   // 🔥 IMPORTANT
              }}
            >
              <option value="timeGridDay">Day</option>
              <option value="timeGridWeek">Week</option>
              <option value="dayGridMonth">Month</option>
            </select>

            <button className="px-2 py-1 border rounded text-sm">12 hrs</button>
            <button className="px-2 py-1 bg-orange-500 text-white rounded text-sm">24 hrs</button>
          </div>

          {/* RIGHT CONTROLS */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              placeholder="Search here..."
              className="border rounded px-3 py-1 text-sm w-full sm:w-48"
            />
            <button className="bg-orange-500 text-white px-3 py-1 rounded text-sm">
              + Add New
            </button>
          </div>
        </div>
        <div className="bg-white border border-orange-400 rounded-lg p-2 sm:p-4 overflow-x-auto">
          <h2 className="text-lg font-semibold mb-2 text-left">
            {new Date().toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </h2>
          {view !== "dayGridMonth" && (
          <FullCalendar
          ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}

            initialView="timeGridDay"
            headerToolbar={false}

            allDaySlot={false}
            expandRows={true}
         
            dayHeaderContent={() => ""}
            titleFormat={{
              year: "numeric",
              month: "short",
              day: "numeric",
            }}
            dayHeaderFormat={{ weekday: "short" }}
            slotDuration="01:00:00"
            slotLabelInterval="01:00"
            dayMaxEvents={false}
            fixedWeekCount={false}
            slotMinTime="09:00:00"
            slotMaxTime="20:00:00"
          
           




            slotLabelFormat={{
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }}

            eventMinHeight={20}
            slotEventOverlap={false}
            eventDidMount={(info) => {
  if (view === "timeGridDay") {
    info.el.style.backgroundColor = "#f4b183";
    info.el.style.borderRadius = "10px";

    /* 🔥 exact bar size */
    info.el.style.height = "30px";

    /* 🔥 perfect vertical alignment */
    info.el.style.margin = "6px 14px 0 14px";
  }
}}
            eventContent={(arg) => {
              if (view === "dayGridMonth") {
                return (
                  <div className="bg-orange-500 text-white text-xs p-1 rounded text-center">
                    {arg.event.title}
                  </div>
                );
              }
            }}
            height="auto"
            contentHeight="auto"

            events={events}
            selectable={true}
            select={(info) => {
              const date = info.startStr.split("T")[0];
              const startTime = info.startStr.split("T")[1]?.slice(0, 5);
              const endTime = info.endStr?.split("T")[1]?.slice(0, 5);

              setEditId(null);

              setForm({
                date,
                startTime,
                endTime,
                category: "",
                subCategory: "",
                students: students.map((s) => s.id),
              });

              setShowModal(true);
            }}
            eventClick={(info) => {
              const event = schedule.find((s) => s.id === info.event.id);

              setEditId(event.id);

              setForm({
                date: info.event.startStr.split("T")[0],
                startTime: info.event.startStr.split("T")[1]?.slice(0, 5),
                endTime: info.event.endStr?.split("T")[1]?.slice(0, 5),
                category: event.category || "",
                subCategory: event.subCategory || "",
                students: event.students || [],
              });

              setShowModal(true);
            }}
          />
          )}
        </div>
        {view === "dayGridMonth" && (
  <div className="mt-4">

    {/* MONTH TITLE */}
    <h2 className="text-lg font-semibold mb-4">April, 2026</h2>

    {/* DAYS GRID */}
    <div className="grid grid-cols-7 gap-4 text-center">
      {Array.from({ length: 30 }).map((_, i) => {
        const day = i + 1;

        const event = events.find(
          (e) => new Date(e.start).getDate() === day
        );

        return (
          <div
            key={day}
            className={`p-3 rounded text-sm ${
              event
                ? "bg-orange-500 text-white"
                : "bg-gray-200"
            }`}
          >
            {day}
            {event && (
              <div className="text-[10px] mt-1">
                {event.title}
              </div>
            )}
          </div>
        );
      })}
    </div>

    {/* EVENT CARDS */}
    <div className="flex flex-wrap gap-3 mt-6">
      {events.map((e) => (
        <div
          key={e.id}
          className="border border-orange-400 rounded px-3 py-2 text-sm"
        >
          {new Date(e.start).toLocaleDateString()} <br />
          {new Date(e.start).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
          {" - "}
          {e.title}
        </div>
      ))}
    </div>
  </div>
)}
        
        {/* ---------- MODAL ---------- */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-3">
            <div className="bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-2xl w-full max-w-md shadow-xl space-y-4">
              <h3 className="text-xl font-semibold text-center">
                {isEdit ? "✏️ Edit Class" : "📅 Schedule Class"}
              </h3>
              {/* TIME RANGE */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-500">Start Time</label>
                  <input
                    type="time"
                    className="w-full border rounded-lg p-2 mt-1"
                    value={form.startTime}
                    onChange={(e) =>
                      setForm({ ...form, startTime: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-500">End Time</label>
                  <input
                    type="time"
                    className="w-full border rounded-lg p-2 mt-1"
                    value={form.endTime}
                    onChange={(e) =>
                      setForm({ ...form, endTime: e.target.value })
                    }
                  />
                </div>
              </div>
              {/* CATEGORY */}
              <div>
                <label className="text-sm text-gray-500">Category</label>
                <select
                  className="w-full border rounded-lg p-2 mt-1"
                  value={form.category}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      category: e.target.value,
                      subCategory: "",
                    })
                  }
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* SUBCATEGORY */}
              <div>
                <label className="text-sm text-gray-500">Sub Category</label>
                <select
                  className="w-full border rounded-lg p-2 mt-1"
                  value={form.subCategory}
                  onChange={(e) =>
                    setForm({ ...form, subCategory: e.target.value })
                  }
                >
                  <option value="">Select SubCategory</option>
                  {(subCategoryMap[form.category] || []).map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              {/* STUDENT COUNT */}
              <div className="bg-blue-50 text-blue-700 text-sm p-2 rounded-lg text-center">
                👥 {form.students.length} students assigned automatically
              </div>

              {/* ACTIONS */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={saveClass}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
                >
                  {isEdit ? "Update" : "Save"}
                </button>

                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditId(null);
                  }}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
