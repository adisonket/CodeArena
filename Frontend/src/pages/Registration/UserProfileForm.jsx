import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  User, Mail, Phone, Calendar, GraduationCap, Upload,
  CheckCircle2, FileText, X, MapPin, LocateFixed,
  Building2, BookOpen, Hash, Shield, ArrowRight,
  Sparkles, Home, Award, Lock,
} from "lucide-react";
import SoftBackdropNew from "../../components/SoftBackdropNew";

const API = "http://localhost:4000/api";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const STEPS = [
  { id: 1, label: "Personal",  icon: User,          color: "#818cf8" },
  { id: 2, label: "Address",   icon: Home,          color: "#a78bfa" },
  { id: 3, label: "Education", icon: GraduationCap, color: "#c084fc" },
  { id: 4, label: "Documents", icon: Shield,        color: "#e879f9" },
];

const indianStates = {
  "Andhra Pradesh": ["Anantapur","Chittoor","East Godavari","Guntur","Krishna","Kurnool","Prakasam","Srikakulam","Visakhapatnam","Vizianagaram","West Godavari","YSR Kadapa"],
  "Arunachal Pradesh": ["Tawang","West Kameng","East Kameng","Papum Pare","Kurung Kumey","Kra Daadi","Lower Subansiri","Upper Subansiri","West Siang","East Siang","Siang","Upper Siang","Lower Siang","Lower Dibang Valley","Dibang Valley","Anjaw","Lohit","Namsai","Changlang","Tirap","Longding"],
  "Assam": ["Baksa","Barpeta","Biswanath","Bongaigaon","Cachar","Charaideo","Chirang","Darrang","Dhemaji","Dhubri","Dibrugarh","Goalpara","Golaghat","Hailakandi","Hojai","Jorhat","Kamrup Metropolitan","Kamrup","Karbi Anglong","Karimganj","Kokrajhar","Lakhimpur","Majuli","Morigaon","Nagaon","Nalbari","Sivasagar","Sonitpur","South Salmara-Mankachar","Tinsukia","Udalguri","West Karbi Anglong"],
  "Bihar": ["Araria","Arwal","Aurangabad","Banka","Begusarai","Bhagalpur","Bhojpur","Buxar","Darbhanga","East Champaran","Gaya","Gopalganj","Jamui","Jehanabad","Kaimur","Katihar","Khagaria","Kishanganj","Lakhisarai","Madhepura","Madhubani","Munger","Muzaffarpur","Nalanda","Nawada","Patna","Purnia","Rohtas","Saharsa","Samastipur","Saran","Sheikhpura","Sheohar","Sitamarhi","Siwan","Supaul","Vaishali","West Champaran"],
  "Chhattisgarh": ["Balod","Baloda Bazar","Balrampur","Bastar","Bemetara","Bijapur","Bilaspur","Dantewada","Dhamtari","Durg","Gariaband","Janjgir-Champa","Jashpur","Kabirdham","Kanker","Kondagaon","Korba","Koriya","Mahasamund","Mungeli","Narayanpur","Raigarh","Raipur","Rajnandgaon","Sukma","Surajpur","Surguja"],
  "Goa": ["North Goa","South Goa"],
  "Gujarat": ["Ahmedabad","Amreli","Anand","Aravalli","Banaskantha","Bharuch","Bhavnagar","Botad","Chhota Udepur","Dahod","Dang","Devbhoomi Dwarka","Gandhinagar","Gir Somnath","Jamnagar","Junagadh","Kheda","Kutch","Mahisagar","Mehsana","Morbi","Narmada","Navsari","Panchmahal","Patan","Porbandar","Rajkot","Sabarkantha","Surat","Surendranagar","Tapi","Vadodara","Valsad"],
  "Haryana": ["Ambala","Bhiwani","Charkhi Dadri","Faridabad","Fatehabad","Gurugram","Hisar","Jhajjar","Jind","Kaithal","Karnal","Kurukshetra","Mahendragarh","Nuh","Palwal","Panchkula","Panipat","Rewari","Rohtak","Sirsa","Sonipat","Yamunanagar"],
  "Himachal Pradesh": ["Bilaspur","Chamba","Hamirpur","Kangra","Kinnaur","Kullu","Lahaul and Spiti","Mandi","Shimla","Sirmaur","Solan","Una"],
  "Jharkhand": ["Bokaro","Chatra","Deoghar","Dhanbad","Dumka","East Singhbhum","Garhwa","Giridih","Godda","Gumla","Hazaribagh","Jamtara","Khunti","Koderma","Latehar","Lohardaga","Pakur","Palamu","Ramgarh","Ranchi","Sahibganj","Seraikela Kharsawan","Simdega","West Singhbhum"],
  "Karnataka": ["Bagalkot","Ballari","Belagavi","Bengaluru Rural","Bengaluru Urban","Bidar","Chamarajanagar","Chikkaballapur","Chikkamagaluru","Chitradurga","Dakshina Kannada","Davanagere","Dharwad","Gadag","Hassan","Haveri","Kalaburagi","Kodagu","Kolar","Koppal","Mandya","Mysuru","Raichur","Ramanagara","Shivamogga","Tumakuru","Udupi","Uttara Kannada","Vijayapura","Yadgir"],
  "Kerala": ["Alappuzha","Ernakulam","Idukki","Kannur","Kasaragod","Kollam","Kottayam","Kozhikode","Malappuram","Palakkad","Pathanamthitta","Thiruvananthapuram","Thrissur","Wayanad"],
  "Madhya Pradesh": ["Agar Malwa","Alirajpur","Anuppur","Ashoknagar","Balaghat","Barwani","Betul","Bhind","Bhopal","Burhanpur","Chhatarpur","Chhindwara","Damoh","Datia","Dewas","Dhar","Dindori","Guna","Gwalior","Harda","Hoshangabad","Indore","Jabalpur","Jhabua","Katni","Khandwa","Khargone","Mandla","Mandsaur","Morena","Narsinghpur","Neemuch","Panna","Raisen","Rajgarh","Ratlam","Rewa","Sagar","Satna","Sehore","Seoni","Shahdol","Shajapur","Sheopur","Shivpuri","Sidhi","Singrauli","Tikamgarh","Ujjain","Umaria","Vidisha"],
  "Maharashtra": ["Ahmednagar","Akola","Amravati","Aurangabad","Beed","Bhandara","Buldhana","Chandrapur","Dhule","Gadchiroli","Gondia","Hingoli","Jalgaon","Jalna","Kolhapur","Latur","Mumbai City","Mumbai Suburban","Nagpur","Nanded","Nandurbar","Nashik","Osmanabad","Palghar","Parbhani","Pune","Raigad","Ratnagiri","Sangli","Satara","Sindhudurg","Solapur","Thane","Wardha","Washim","Yavatmal"],
  "Manipur": ["Bishnupur","Chandel","Churachandpur","Imphal East","Imphal West","Jiribam","Kakching","Kamjong","Kangpokpi","Noney","Pherzawl","Senapati","Tamenglong","Tengnoupal","Thoubal","Ukhrul"],
  "Meghalaya": ["East Garo Hills","East Jaintia Hills","East Khasi Hills","North Garo Hills","Ri Bhoi","South Garo Hills","South West Garo Hills","South West Khasi Hills","West Garo Hills","West Jaintia Hills","West Khasi Hills"],
  "Mizoram": ["Aizawl","Champhai","Kolasib","Lawngtlai","Lunglei","Mamit","Saiha","Serchhip"],
  "Nagaland": ["Dimapur","Kiphire","Kohima","Longleng","Mokokchung","Mon","Peren","Phek","Tuensang","Wokha","Zunheboto"],
  "Odisha": ["Angul","Balangir","Balasore","Bargarh","Bhadrak","Boudh","Cuttack","Deogarh","Dhenkanal","Gajapati","Ganjam","Jagatsinghpur","Jajpur","Jharsuguda","Kalahandi","Kandhamal","Kendrapara","Kendujhar","Khordha","Koraput","Malkangiri","Mayurbhanj","Nabarangpur","Nayagarh","Nuapada","Puri","Rayagada","Sambalpur","Sonepur","Sundargarh"],
  "Punjab": ["Amritsar","Barnala","Bathinda","Faridkot","Fatehgarh Sahib","Fazilka","Ferozepur","Gurdaspur","Hoshiarpur","Jalandhar","Kapurthala","Ludhiana","Mansa","Moga","Muktsar","Pathankot","Patiala","Rupnagar","Sahibzada Ajit Singh Nagar","Sangrur","Shahid Bhagat Singh Nagar","Sri Muktsar Sahib","Tarn Taran"],
  "Rajasthan": ["Ajmer","Alwar","Banswara","Baran","Barmer","Bharatpur","Bhilwara","Bikaner","Bundi","Chittorgarh","Churu","Dausa","Dholpur","Dungarpur","Hanumangarh","Jaipur","Jaisalmer","Jalore","Jhalawar","Jhunjhunu","Jodhpur","Karauli","Kota","Nagaur","Pali","Pratapgarh","Rajsamand","Sawai Madhopur","Sikar","Sirohi","Sri Ganganagar","Tonk","Udaipur"],
  "Sikkim": ["East Sikkim","North Sikkim","South Sikkim","West Sikkim"],
  "Tamil Nadu": ["Ariyalur","Chengalpattu","Chennai","Coimbatore","Cuddalore","Dharmapuri","Dindigul","Erode","Kallakurichi","Kancheepuram","Kanyakumari","Karur","Krishnagiri","Madurai","Nagapattinam","Namakkal","Nilgiris","Perambalur","Pudukkottai","Ramanathapuram","Ranipet","Salem","Sivaganga","Tenkasi","Thanjavur","Theni","Thoothukudi","Tiruchirappalli","Tirunelveli","Tirupathur","Tiruppur","Tiruvallur","Tiruvannamalai","Tiruvarur","Vellore","Viluppuram","Virudhunagar"],
  "Telangana": ["Adilabad","Bhadradri Kothagudem","Hyderabad","Jagtial","Jangaon","Jayashankar Bhupalpally","Jogulamba Gadwal","Kamareddy","Karimnagar","Khammam","Kumuram Bheem","Mahabubabad","Mahabubnagar","Mancherial","Medak","Medchal","Mulugu","Nagarkurnool","Nalgonda","Narayanpet","Nirmal","Nizamabad","Peddapalli","Rajanna Sircilla","Rangareddy","Sangareddy","Siddipet","Suryapet","Vikarabad","Wanaparthy","Warangal Rural","Warangal Urban","Yadadri Bhuvanagiri"],
  "Tripura": ["Dhalai","Gomati","Khowai","North Tripura","Sepahijala","South Tripura","Unakoti","West Tripura"],
  "Uttar Pradesh": ["Agra","Aligarh","Allahabad","Ambedkar Nagar","Amethi","Amroha","Auraiya","Azamgarh","Baghpat","Bahraich","Ballia","Balrampur","Banda","Barabanki","Bareilly","Basti","Bhadohi","Bijnor","Budaun","Bulandshahr","Chandauli","Chitrakoot","Deoria","Etah","Etawah","Faizabad","Farrukhabad","Fatehpur","Firozabad","Gautam Buddha Nagar","Ghaziabad","Ghazipur","Gonda","Gorakhpur","Hamirpur","Hapur","Hardoi","Hathras","Jalaun","Jaunpur","Jhansi","Kannauj","Kanpur Dehat","Kanpur Nagar","Kasganj","Kaushambi","Kheri","Kushinagar","Lalitpur","Lucknow","Maharajganj","Mahoba","Mainpuri","Mathura","Mau","Meerut","Mirzapur","Moradabad","Muzaffarnagar","Pilibhit","Pratapgarh","RaeBareli","Rampur","Saharanpur","Sambhal","Sant Kabir Nagar","Shahjahanpur","Shamli","Shravasti","Siddharthnagar","Sitapur","Sonbhadra","Sultanpur","Unnao","Varanasi"],
  "Uttarakhand": ["Almora","Bageshwar","Chamoli","Champawat","Dehradun","Haridwar","Nainital","Pauri Garhwal","Pithoragarh","Rudraprayag","Tehri Garhwal","Udham Singh Nagar","Uttarkashi"],
  "West Bengal": ["Alipurduar","Bankura","Birbhum","Cooch Behar","Dakshin Dinajpur","Darjeeling","Hooghly","Howrah","Jalpaiguri","Jhargram","Kalimpong","Kolkata","Malda","Murshidabad","Nadia","North 24 Parganas","Paschim Bardhaman","Paschim Medinipur","Purba Bardhaman","Purba Medinipur","Purulia","South 24 Parganas","Uttar Dinajpur"],
  "Delhi": ["Central Delhi","East Delhi","New Delhi","North Delhi","North East Delhi","North West Delhi","Shahdara","South Delhi","South East Delhi","South West Delhi","West Delhi"],
  "Andaman and Nicobar Islands": ["Nicobar","North and Middle Andaman","South Andaman"],
  "Chandigarh": ["Chandigarh"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Dadra and Nagar Haveli","Daman","Diu"],
  "Lakshadweep": ["Lakshadweep"],
  "Puducherry": ["Karaikal","Mahe","Puducherry","Yanam"],
  "Ladakh": ["Kargil","Leh"],
  "Jammu and Kashmir": ["Anantnag","Bandipora","Baramulla","Budgam","Doda","Ganderbal","Jammu","Kathua","Kishtwar","Kulgam","Kupwara","Poonch","Pulwama","Rajouri","Ramban","Reasi","Samba","Shopian","Srinagar","Udhampur"],
};

// ── Locked field badge ────────────────────────────────────────────────────────
function LockedBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-amber-400/80 bg-amber-400/10 border border-amber-400/20 rounded-full px-2 py-0.5 ml-2">
      <Lock size={7} /> Saved
    </span>
  );
}

// ── Locked notice banner ──────────────────────────────────────────────────────
function LockedNoticeBanner({ navigate }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-amber-500/8 border border-amber-500/20 rounded-xl mb-4">
      <Lock className="text-amber-400/80 flex-shrink-0" size={14} />
      <p className="text-amber-300/80 text-xs leading-relaxed">
        Some fields are already saved and cannot be edited here.{" "}
        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="underline text-amber-300 hover:text-amber-200 transition-colors font-medium"
        >
          Go to Profile page
        </button>{" "}
        to make changes.
      </p>
    </div>
  );
}

function Field({ label, icon: Icon, children, locked }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-violet-300/70 uppercase tracking-widest flex items-center gap-1.5">
          {Icon && <Icon size={10} className="text-violet-400" />}
          {label}
          {locked && <LockedBadge />}
        </label>
      )}
      {children}
    </div>
  );
}

const inputCls =
  "w-full h-11 bg-[#1a0b2e]/60 border border-violet-500/20 rounded-xl px-4 text-white text-sm outline-none focus:border-violet-400/60 focus:bg-[#2a1454]/40 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.12)] transition-all duration-200 placeholder:text-gray-600";

const lockedInputCls =
  "w-full h-11 bg-[#1a0b2e]/30 border border-amber-500/15 rounded-xl px-4 text-gray-400 text-sm outline-none cursor-not-allowed select-none";

const selectCls =
  "w-full h-11 bg-[#1a0b2e]/60 border border-violet-500/20 rounded-xl px-4 text-white text-sm outline-none focus:border-violet-400/60 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.12)] transition-all duration-200 appearance-none cursor-pointer";

const lockedSelectCls =
  "w-full h-11 bg-[#1a0b2e]/30 border border-amber-500/15 rounded-xl px-4 text-gray-400 text-sm outline-none cursor-not-allowed appearance-none";

function IconInput({ icon: Icon, locked, ...props }) {
  return (
    <div className="relative">
      {Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400/70 pointer-events-none">
          <Icon size={15} />
        </div>
      )}
      {locked && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400/50 pointer-events-none">
          <Lock size={12} />
        </div>
      )}
      <input
        {...props}
        readOnly={locked}
        className={`${locked ? lockedInputCls : inputCls} ${Icon ? "pl-10" : ""} ${locked ? "pr-9" : ""} ${props.className || ""}`}
      />
    </div>
  );
}

function UploadZone({ file, name, onFileChange, onPreview, locked, savedDoc }) {
  // If there's a saved doc (from DB) but no new file selected
  if (locked && savedDoc && !file) {
    return (
      <div className="w-full h-36 bg-[#1a0b2e]/30 border border-amber-500/15 rounded-2xl flex flex-col items-center justify-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
          <FileText className="text-amber-400/70" size={18} />
        </div>
        <p className="text-amber-300/70 text-xs font-medium">{savedDoc.name}</p>
        <p className="text-gray-600 text-[10px]">Saved · edit from Profile page</p>
      </div>
    );
  }

  return (
    <label className={`relative group overflow-hidden w-full h-36 bg-[#1a0b2e]/40 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${locked ? "border-amber-500/15 cursor-not-allowed opacity-60" : "border-violet-500/25 cursor-pointer hover:border-violet-400/50 hover:bg-[#2a1454]/30"}`}>
      {file ? (
        <>
          {file.type?.startsWith("image/") ? (
            <img src={URL.createObjectURL(file)} alt="preview" className="absolute inset-0 w-full h-full object-cover rounded-2xl opacity-70" />
          ) : (
            <div className="flex flex-col items-center gap-2 z-10">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <FileText className="text-violet-300" size={18} />
              </div>
              <p className="text-white text-xs text-center px-4 font-medium">{file.name}</p>
            </div>
          )}
          {!locked && (
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center rounded-2xl z-20">
              <button type="button" onClick={(e) => { e.preventDefault(); onPreview(); }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-violet-500/30 hover:scale-105 transition-all duration-200">
                Preview
              </button>
            </div>
          )}
          <div className="absolute top-2 right-2 z-30 bg-green-500/90 rounded-full p-0.5">
            <CheckCircle2 size={13} className="text-white" />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center group-hover:bg-violet-500/25 transition-all duration-200">
            <Upload className="text-violet-400" size={18} />
          </div>
          <div className="text-center">
            <p className="text-gray-300 text-sm font-medium">Click to upload</p>
            <p className="text-gray-600 text-xs mt-0.5">Image or PDF, up to 5MB</p>
          </div>
        </div>
      )}
      {!locked && <input type="file" name={name} accept="image/*,.pdf" onChange={onFileChange} hidden />}
    </label>
  );
}

export default function UserpanForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploadPopup, setUploadPopup] = useState({ show: false, name: "" });
  const [previewFile, setPreviewFile] = useState(null);
  const [previewType, setPreviewType] = useState("");

  // Tracks which fields came pre-filled from DB (locked from editing here)
  const [savedFields, setSavedFields] = useState({});
  // Saved doc metadata from DB (for display without a File object)
  const [savedDocs, setSavedDocs] = useState({ aadhaar: null, pan: null });

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "", dob: "",
    nationality: "", state: "", district: "", pin: "", locality: "", postOffice: "",
    degree: "", institution: "", university: "", year: "", cgpa: "",
    aadhaarNumber: "", panNumber: "", aadhaar: null, pan: null,
  });

  // ── Fetch existing profile on mount ────────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API}/profile`, { headers: authHeader() });
        const json = await res.json();
        if (!json.success) return;

        const u = json.user;
        const edu = u.education?.[0] || {};

        // Build the pre-filled values
        const prefilled = {
          firstName:    u.firstName    || "",
          lastName:     u.lastName     || "",
          email:        u.email        || "",
          phone:        u.phone        || "",
          dob:          u.dob          || "",
          nationality:  u.nationality  || "",
          state:        u.address?.state      || "",
          district:     u.address?.district   || "",
          pin:          u.address?.pin        || "",
          locality:     u.address?.locality   || "",
          postOffice:   u.address?.postOffice || "",
          degree:       edu.degree      || "",
          institution:  edu.institution || "",
          university:   edu.university  || "",
          year:         edu.year        || "",
          cgpa:         edu.cgpa        || "",
          aadhaarNumber: u.aadhaarNumber || "",
          panNumber:    u.panNumber     || "",
          aadhaar: null,
          pan: null,
        };

        // Mark which scalar fields already have data saved in DB
        const locked = {};
        const scalarKeys = [
          "firstName","lastName","email","phone","dob",
          "nationality","state","district","pin","locality","postOffice",
          "degree","institution","university","year","cgpa",
          "aadhaarNumber","panNumber",
        ];
        scalarKeys.forEach(k => {
          if (prefilled[k]?.trim()) locked[k] = true;
        });

        setFormData(prev => ({ ...prev, ...prefilled }));
        setSavedFields(locked);
        setSavedDocs({
          aadhaar: u.aadhaarDoc?.name ? u.aadhaarDoc : null,
          pan:     u.panDoc?.name     ? u.panDoc     : null,
        });
      } catch (err) {
        console.error("Profile prefill error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const isLocked = (field) => !!savedFields[field];

  // Returns true if ANY field on the current step is locked
  const stepHasLockedFields = () => {
    const stepFields = {
      1: ["firstName","lastName","email","phone","dob"],
      2: ["nationality","state","district","pin","locality","postOffice"],
      3: ["degree","institution","university","year","cgpa"],
      4: ["aadhaarNumber","panNumber"],
    };
    return (stepFields[step] || []).some(f => isLocked(f)) ||
      (step === 4 && (savedDocs.aadhaar || savedDocs.pan));
  };

  const handleChange = (e) => {
    const { name, files, value } = e.target;
    // Don't allow changes to locked scalar fields
    if (isLocked(name)) return;

    if (files?.[0]) {
      const file = files[0];
      setFormData((p) => ({ ...p, [name]: file }));
      setUploadPopup({ show: true, name: file.name });
      setTimeout(() => setUploadPopup({ show: false, name: "" }), 2800);
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
  };

  const fetchLocationByPin = async (pin) => {
    if (isLocked("state") && isLocked("district")) return;
    if (pin.length !== 6) return;
    try {
      const res = await axios.get(`https://api.postalpincode.in/pincode/${pin}`);
      const data = res.data[0];
      if (data.Status === "Success") {
        const po = data.PostOffice[0];
        setFormData((p) => ({
          ...p,
          nationality: isLocked("nationality") ? p.nationality : "India",
          state:       isLocked("state")       ? p.state       : po.State,
          district:    isLocked("district")    ? p.district    : po.District,
          pin,
        }));
      }
    } catch {}
  };

  const detectLocation = () => {
    if (isLocked("state") && isLocked("district")) return;
    if (!navigator.geolocation) return alert("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { data } = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
        );
        const addr = data.address;
        const pin = addr.postcode || "";
        setFormData((p) => ({
          ...p,
          nationality: isLocked("nationality") ? p.nationality : "India",
          state:       isLocked("state")       ? p.state       : (addr.state || addr.region || ""),
          district:    isLocked("district")    ? p.district    : (addr.county || addr.city_district || ""),
          pin:         isLocked("pin")         ? p.pin         : pin,
        }));
        if (pin) fetchLocationByPin(pin);
      } catch {}
    }, () => alert("Location access denied"));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const fd = new FormData();
      // Only send fields that are NOT locked (locked ones are already in DB)
      const appendIfUnlocked = (key, val) => { if (!isLocked(key) && val) fd.append(key, val); };

      appendIfUnlocked("firstName",    formData.firstName);
      appendIfUnlocked("lastName",     formData.lastName);
      appendIfUnlocked("email",        formData.email);
      appendIfUnlocked("phone",        formData.phone);
      appendIfUnlocked("dob",          formData.dob);
      appendIfUnlocked("nationality",  formData.nationality);
      appendIfUnlocked("state",        formData.state);
      appendIfUnlocked("district",     formData.district);
      appendIfUnlocked("pin",          formData.pin);
      appendIfUnlocked("locality",     formData.locality);
      appendIfUnlocked("postOffice",   formData.postOffice);
      appendIfUnlocked("degree",       formData.degree);
      appendIfUnlocked("institution",  formData.institution);
      appendIfUnlocked("university",   formData.university);
      appendIfUnlocked("year",         formData.year);
      appendIfUnlocked("cgpa",         formData.cgpa);
      appendIfUnlocked("aadhaarNumber", formData.aadhaarNumber);
      appendIfUnlocked("panNumber",    formData.panNumber);

      if (formData.aadhaar && !savedDocs.aadhaar) fd.append("aadhaar", formData.aadhaar);
      if (formData.pan     && !savedDocs.pan)     fd.append("pan",     formData.pan);

      const res = await fetch(`${API}/profile/complete-setup`, {
        method: "POST",
        headers: authHeader(),
        body: fd,
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setDone(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading state ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <SoftBackdropNew />
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-400 rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">Loading your profile...</p>
          </div>
        </div>
      </>
    );
  }

  // ── Done screen ──────────────────────────────────────────────────────────────
  if (done) {
    return (
      <>
        <SoftBackdropNew />
        <div className="min-h-screen flex items-center justify-center px-4 py-6 relative overflow-hidden">
          <div className="absolute top-[-80px] right-[-80px] w-[350px] h-[350px] bg-violet-700/20 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-[-80px] left-[-80px] w-[300px] h-[300px] bg-indigo-700/20 blur-[100px] rounded-full pointer-events-none" />
          <div className="relative w-full max-w-md bg-white/[0.03] backdrop-blur-2xl border border-violet-500/20 rounded-3xl p-10 shadow-2xl text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-violet-500/30 to-green-500/30 border border-green-500/30 flex items-center justify-center">
              <CheckCircle2 className="text-green-400" size={36} />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">You're all set!</h2>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
              Your profile is complete. Head to the dashboard to start practicing and tracking your progress.
            </p>
            <button onClick={() => navigate("/profile")}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2">
              Go to Profile <ArrowRight size={16} />
            </button>
            <button onClick={() => navigate("/")}
              className="mt-3 w-full h-11 rounded-xl border border-violet-500/20 text-gray-400 text-sm hover:bg-violet-500/10 hover:text-white transition-all duration-200">
              Back to Home
            </button>
          </div>
        </div>
      </>
    );
  }

  const currentStep = STEPS[step - 1];

  return (
    <>
      <SoftBackdropNew />

      <div className="fixed top-[-100px] left-[-100px] w-[400px] h-[400px] bg-violet-800/20 blur-[130px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-100px] right-[-100px] w-[350px] h-[350px] bg-indigo-800/15 blur-[110px] rounded-full pointer-events-none" />

      {/* Upload toast */}
      {uploadPopup.show && (
        <div className="fixed top-5 right-5 z-50">
          <div className="bg-[#0d1117] border border-green-500/30 shadow-2xl shadow-green-500/10 rounded-2xl px-4 py-3 flex items-center gap-3 min-w-[280px]">
            <div className="w-7 h-7 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="text-green-400" size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium">File attached</p>
              <p className="text-gray-500 text-xs truncate mt-0.5">{uploadPopup.name}</p>
            </div>
            <button onClick={() => setUploadPopup({ show: false, name: "" })} className="text-gray-600 hover:text-gray-300 transition-colors">
              <X size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Preview modal */}
      {previewFile && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-lg flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl h-[85vh] bg-[#0d1117] rounded-3xl overflow-hidden border border-violet-500/20 shadow-2xl">
            <button type="button" onClick={() => { setPreviewFile(null); setPreviewType(""); }}
              className="absolute top-4 right-4 z-50 w-9 h-9 bg-white/10 hover:bg-red-500/80 text-white rounded-full flex items-center justify-center transition-all duration-200">
              <X size={16} />
            </button>
            <div className="w-full h-full flex items-center justify-center bg-black/60">
              {previewType.includes("pdf")
                ? <iframe src={previewFile} title="Preview" className="w-full h-full" />
                : <img src={previewFile} alt="Preview" className="max-w-full max-h-full object-contain" />
              }
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen flex items-center justify-center px-4 py-4 relative">
        <div className="relative w-full max-w-2xl">

          <div className="text-center mb-4">
            <h1 className="text-4xl font-bold text-white tracking-tight">
              Code<span className="text-violet-400">Arena</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">Complete your profile to unlock everything</p>
          </div>

          {/* Step indicators */}
          <div className="flex items-center justify-center mb-4">
            {STEPS.map((s, idx) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isDone = step > s.id;
              return (
                <React.Fragment key={s.id}>
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isDone   ? "bg-violet-500 border-violet-500 text-white"
                      : isActive ? "bg-violet-500/20 border-violet-400 text-violet-300"
                               : "bg-transparent border-white/10 text-gray-600"
                    }`}>
                      {isDone ? <CheckCircle2 size={14} /> : <Icon size={14} />}
                    </div>
                    <span className={`text-[10px] font-medium tracking-wide transition-colors duration-200 ${
                      isActive ? "text-violet-300" : isDone ? "text-violet-400/70" : "text-gray-600"
                    }`}>
                      {s.label}
                    </span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className={`w-16 h-px mb-4 mx-1 transition-all duration-500 ${step > s.id ? "bg-violet-500" : "bg-white/8"}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Card */}
          <div className="bg-white/[0.03] backdrop-blur-2xl border border-violet-500/15 rounded-3xl p-6 shadow-2xl shadow-violet-950/50">

            {/* Step title */}
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/[0.06]">
              <div className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
                <currentStep.icon size={15} className="text-violet-400" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-base leading-none">
                  {["Basic Details", "Address Details", "Education Details", "KYC Documents"][step - 1]}
                </h2>
                <p className="text-gray-600 text-xs mt-1">
                  {["Your personal information", "Where you're based", "Your academic background", "Identity verification"][step - 1]}
                </p>
              </div>
              <div className="ml-auto text-xs text-gray-600 font-mono">{step} / {STEPS.length}</div>
            </div>

            {/* Locked notice — shown only when this step has saved fields */}
            {stepHasLockedFields() && <LockedNoticeBanner navigate={navigate} />}

            {/* ── STEP 1: Personal ─────────────────────────────────────── */}
            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="First Name" icon={User} locked={isLocked("firstName")}>
                  <IconInput icon={User} type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="John" locked={isLocked("firstName")} />
                </Field>
                <Field label="Last Name" icon={User} locked={isLocked("lastName")}>
                  <IconInput icon={User} type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Singh" locked={isLocked("lastName")} />
                </Field>
                <div className="md:col-span-2">
                  <Field label="Email Address" icon={Mail} locked={isLocked("email")}>
                    <IconInput icon={Mail} type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" locked={isLocked("email")} />
                  </Field>
                </div>
                <Field label="Phone Number" icon={Phone} locked={isLocked("phone")}>
                  <IconInput icon={Phone} type="tel" name="phone" maxLength="10" value={formData.phone} onChange={handleChange} placeholder="9876543210" locked={isLocked("phone")} />
                </Field>
                <Field label="Date of Birth" icon={Calendar} locked={isLocked("dob")}>
                  <IconInput icon={Calendar} type="date" name="dob" value={formData.dob} onChange={handleChange} locked={isLocked("dob")} />
                </Field>
              </div>
            )}

            {/* ── STEP 2: Address ──────────────────────────────────────── */}
            {step === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Nationality" locked={isLocked("nationality")}>
                  {isLocked("nationality") ? (
                    <div className="relative">
                      <input readOnly value={formData.nationality} className={lockedInputCls} />
                      <Lock size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400/50" />
                    </div>
                  ) : (
                    <select name="nationality" value={formData.nationality} onChange={handleChange} className={selectCls}>
                      <option value="" className="bg-[#0d0517]">Select Nationality</option>
                      <option value="India" className="bg-[#0d0517]">Indian</option>
                    </select>
                  )}
                </Field>

                {formData.nationality === "India" && (
                  <Field label="State" locked={isLocked("state")}>
                    {isLocked("state") ? (
                      <div className="relative">
                        <input readOnly value={formData.state} className={lockedInputCls} />
                        <Lock size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400/50" />
                      </div>
                    ) : (
                      <select name="state" value={formData.state} onChange={handleChange} className={selectCls}>
                        <option value="" className="bg-[#0d0517]">Select State</option>
                        {Object.keys(indianStates).map((s) => (
                          <option key={s} value={s} className="bg-[#0d0517]">{s}</option>
                        ))}
                      </select>
                    )}
                  </Field>
                )}

                {formData.state && (
                  <Field label="District" locked={isLocked("district")}>
                    {isLocked("district") ? (
                      <div className="relative">
                        <input readOnly value={formData.district} className={lockedInputCls} />
                        <Lock size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400/50" />
                      </div>
                    ) : (
                      <select name="district" value={formData.district} onChange={handleChange} className={selectCls}>
                        <option value="" className="bg-[#0d0517]">Select District</option>
                        {(indianStates[formData.state] || []).map((d) => (
                          <option key={d} value={d} className="bg-[#0d0517]">{d}</option>
                        ))}
                      </select>
                    )}
                  </Field>
                )}

                <Field label="PIN Code" icon={MapPin} locked={isLocked("pin")}>
                  <div className="relative">
                    <input
                      type="text" name="pin" maxLength="6" value={formData.pin}
                      readOnly={isLocked("pin")}
                      onChange={(e) => { handleChange(e); fetchLocationByPin(e.target.value); }}
                      placeholder="400001"
                      className={`${isLocked("pin") ? lockedInputCls : inputCls} pr-12`}
                    />
                    {!isLocked("pin") && (
                      <button type="button" onClick={detectLocation}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-violet-500/15 hover:bg-violet-500/30 flex items-center justify-center text-violet-400 transition-all duration-200">
                        <LocateFixed size={13} />
                      </button>
                    )}
                    {isLocked("pin") && (
                      <Lock size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400/50" />
                    )}
                  </div>
                  {!isLocked("pin") && (
                    <p className="text-gray-700 text-[10px] mt-1 flex items-center gap-1">
                      <MapPin size={9} /> Auto-fills state & district · or use GPS
                    </p>
                  )}
                </Field>

                <Field label="Locality / Town" locked={isLocked("locality")}>
                  <input
                    type="text" name="locality" value={formData.locality}
                    readOnly={isLocked("locality")}
                    onChange={handleChange} placeholder="Village / Town / Area"
                    className={isLocked("locality") ? lockedInputCls : inputCls}
                  />
                </Field>

                <Field label="Post Office" locked={isLocked("postOffice")}>
                  <input
                    type="text" name="postOffice" value={formData.postOffice}
                    readOnly={isLocked("postOffice")}
                    onChange={handleChange} placeholder="Post Office name"
                    className={isLocked("postOffice") ? lockedInputCls : inputCls}
                  />
                </Field>
              </div>
            )}

            {/* ── STEP 3: Education ────────────────────────────────────── */}
            {step === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <Field label="Degree / Program" icon={Award} locked={isLocked("degree")}>
                    <IconInput icon={Award} type="text" name="degree" value={formData.degree} onChange={handleChange} placeholder="e.g. MCA, B.Tech, BCA, B.Sc." locked={isLocked("degree")} />
                  </Field>
                </div>
                <Field label="Institution / College" icon={Building2} locked={isLocked("institution")}>
                  <IconInput icon={Building2} type="text" name="institution" value={formData.institution} onChange={handleChange} placeholder="Your College / Institute" locked={isLocked("institution")} />
                </Field>
                <Field label="University" icon={GraduationCap} locked={isLocked("university")}>
                  <IconInput icon={GraduationCap} type="text" name="university" value={formData.university} onChange={handleChange} placeholder="Affiliated University" locked={isLocked("university")} />
                </Field>
                <Field label="Passing Year" icon={Calendar} locked={isLocked("year")}>
                  <IconInput icon={Calendar} type="text" name="year" value={formData.year} onChange={handleChange} placeholder="2025" locked={isLocked("year")} />
                </Field>
                <Field label="CGPA / Percentage" locked={isLocked("cgpa")}>
                  <IconInput type="text" name="cgpa" value={formData.cgpa} onChange={handleChange} placeholder="e.g. 8.5 or 85%" locked={isLocked("cgpa")} />
                </Field>
                <div className="md:col-span-2 p-3 bg-violet-500/5 border border-violet-500/15 rounded-xl">
                  <p className="text-violet-400/80 text-xs font-medium mb-0.5 flex items-center gap-1.5">
                    <Sparkles size={10} /> This shows on your CodeArena profile
                  </p>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    Your education is displayed on your public profile and used to match you with relevant interview questions.
                  </p>
                </div>
              </div>
            )}

            {/* ── STEP 4: Documents ────────────────────────────────────── */}
            {step === 4 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Aadhaar */}
                <div className="flex flex-col gap-2.5">
                  <Field label="Aadhaar Number" icon={Hash} locked={isLocked("aadhaarNumber")}>
                    <div className="relative">
                      <input
                        type="text" name="aadhaarNumber" value={formData.aadhaarNumber}
                        readOnly={isLocked("aadhaarNumber")}
                        onChange={(e) => {
                          if (isLocked("aadhaarNumber")) return;
                          let v = e.target.value.replace(/\D/g, "").slice(0, 12);
                          v = v.replace(/(\d{4})(\d{4})(\d{0,4})/, (_, a, b, c) => [a, b, c].filter(Boolean).join(" "));
                          setFormData((p) => ({ ...p, aadhaarNumber: v }));
                        }}
                        placeholder="1234 5678 9012"
                        className={`${isLocked("aadhaarNumber") ? lockedInputCls : inputCls} tracking-widest font-mono ${isLocked("aadhaarNumber") ? "pr-9" : ""}`}
                      />
                      {isLocked("aadhaarNumber") && (
                        <Lock size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400/50" />
                      )}
                    </div>
                  </Field>
                  <Field label="Aadhaar Document" locked={!!savedDocs.aadhaar}>
                    <UploadZone
                      file={formData.aadhaar} name="aadhaar" onFileChange={handleChange}
                      locked={!!savedDocs.aadhaar}
                      savedDoc={savedDocs.aadhaar}
                      onPreview={() => { setPreviewFile(URL.createObjectURL(formData.aadhaar)); setPreviewType(formData.aadhaar.type); }}
                    />
                  </Field>
                  {formData.aadhaar && !savedDocs.aadhaar && (
                    <div className="flex items-center gap-2 bg-green-500/8 border border-green-500/20 rounded-xl px-3 py-2">
                      <CheckCircle2 className="text-green-400 flex-shrink-0" size={13} />
                      <p className="text-green-300/80 text-xs font-medium truncate">{formData.aadhaar.name}</p>
                    </div>
                  )}
                </div>

                {/* PAN */}
                <div className="flex flex-col gap-2.5">
                  <Field label="PAN Number" icon={Hash} locked={isLocked("panNumber")}>
                    <div className="relative">
                      <input
                        type="text" name="panNumber" value={formData.panNumber}
                        readOnly={isLocked("panNumber")}
                        onChange={(e) => {
                          if (isLocked("panNumber")) return;
                          const v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
                          setFormData((p) => ({ ...p, panNumber: v }));
                        }}
                        placeholder="ABCDE1234F"
                        className={`${isLocked("panNumber") ? lockedInputCls : inputCls} tracking-widest font-mono ${isLocked("panNumber") ? "pr-9" : ""}`}
                      />
                      {isLocked("panNumber") && (
                        <Lock size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400/50" />
                      )}
                    </div>
                  </Field>
                  <Field label="PAN Document" locked={!!savedDocs.pan}>
                    <UploadZone
                      file={formData.pan} name="pan" onFileChange={handleChange}
                      locked={!!savedDocs.pan}
                      savedDoc={savedDocs.pan}
                      onPreview={() => { setPreviewFile(URL.createObjectURL(formData.pan)); setPreviewType(formData.pan.type); }}
                    />
                  </Field>
                  {formData.pan && !savedDocs.pan && (
                    <div className="flex items-center gap-2 bg-green-500/8 border border-green-500/20 rounded-xl px-3 py-2">
                      <CheckCircle2 className="text-green-400 flex-shrink-0" size={13} />
                      <p className="text-green-300/80 text-xs font-medium truncate">{formData.pan.name}</p>
                    </div>
                  )}
                </div>

                {/* Security note */}
                <div className="md:col-span-2 p-3 bg-violet-500/5 border border-violet-500/15 rounded-xl flex items-start gap-3">
                  <Shield className="text-violet-400/70 flex-shrink-0 mt-0.5" size={14} />
                  <div>
                    <p className="text-violet-300/80 text-xs font-semibold mb-0.5">Encrypted & Secure</p>
                    <p className="text-gray-600 text-xs leading-relaxed">
                      Your documents are encrypted and stored securely. They are only used for identity verification and are never shared with third parties.
                    </p>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="md:col-span-2 flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                    <X className="text-red-400 flex-shrink-0" size={13} />
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                )}
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/[0.05]">
              <div className="flex gap-2">
                {step > 1 && (
                  <button type="button" onClick={() => setStep((p) => p - 1)}
                    className="px-5 h-10 rounded-xl border border-violet-500/20 text-gray-400 text-sm hover:bg-violet-500/10 hover:text-white hover:border-violet-500/40 transition-all duration-200">
                    ← Back
                  </button>
                )}
                {step === 1 && (
                  <button type="button" onClick={() => navigate("/")}
                    className="px-5 h-10 rounded-xl border border-white/8 text-gray-600 text-sm hover:bg-white/5 hover:text-gray-400 transition-all duration-200">
                    Skip for now
                  </button>
                )}
              </div>

              {step < 4 ? (
                <button type="button" onClick={() => setStep((p) => p + 1)}
                  className="px-6 h-10 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02] transition-all duration-200 flex items-center gap-2">
                  Continue <ArrowRight size={14} />
                </button>
              ) : (
                <button type="button" onClick={handleSubmit} disabled={submitting}
                  className="px-6 h-10 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 transition-all duration-200 flex items-center gap-2">
                  {submitting ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                  ) : (
                    <>Complete Setup <CheckCircle2 size={14} /></>
                  )}
                </button>
              )}
            </div>
          </div>

          <p className="text-center text-gray-700 text-xs mt-3">
            All fields are optional · You can update everything later from your profile
          </p>
        </div>
      </div>
    </>
  );
}