import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
  User,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  Upload,
  CheckCircle2,
  FileText,
  ImageIcon,
  X,
  MapPin,
  LocateFixed,
} from "lucide-react";
import SoftBackdropNew from "../../components/SoftBackdropNew";

export default function UserpanForm() {
  const [step, setStep] = useState(1);

  const [uploadPopup, setUploadPopup] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");

  const [previewFiles, setPreviewFiles] = useState({
    aadhaar: null,
    pan: null,
  });

  const [previewFile, setPreviewFile] = useState(null);
  const [previewType, setPreviewType] = useState("");

  const indianStates = {
    "Andhra Pradesh": ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool", "Prakasam", "Srikakulam", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR Kadapa"],
    "Arunachal Pradesh": ["Tawang", "West Kameng", "East Kameng", "Papum Pare", "Kurung Kumey", "Kra Daadi", "Lower Subansiri", "Upper Subansiri", "West Siang", "East Siang", "Siang", "Upper Siang", "Lower Siang", "Lower Dibang Valley", "Dibang Valley", "Anjaw", "Lohit", "Namsai", "Changlang", "Tirap", "Longding"],
    "Assam": ["Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo", "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Goalpara", "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup Metropolitan", "Kamrup", "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon", "Nagaon", "Nalbari", "Sivasagar", "Sonitpur", "South Salmara-Mankachar", "Tinsukia", "Udalguri", "West Karbi Anglong"],
    "Bihar": ["Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"],
    "Chhattisgarh": ["Balod", "Baloda Bazar", "Balrampur", "Bastar", "Bemetara", "Bijapur", "Bilaspur", "Dantewada", "Dhamtari", "Durg", "Gariaband", "Janjgir-Champa", "Jashpur", "Kabirdham", "Kanker", "Kondagaon", "Korba", "Koriya", "Mahasamund", "Mungeli", "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", "Sukma", "Surajpur", "Surguja"],
    "Goa": ["North Goa", "South Goa"],
    "Gujarat": ["Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar", "Botad", "Chhota Udepur", "Dahod", "Dang", "Devbhoomi Dwarka", "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kheda", "Kutch", "Mahisagar", "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar", "Tapi", "Vadodara", "Valsad"],
    "Haryana": ["Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram", "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Nuh", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"],
    "Himachal Pradesh": ["Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", "Lahaul and Spiti", "Mandi", "Shimla", "Sirmaur", "Solan", "Una"],
    "Jharkhand": ["Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", "Sahibganj", "Seraikela Kharsawan", "Simdega", "West Singhbhum"],
    "Karnataka": ["Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", "Bidar", "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada", "Vijayapura", "Yadgir"],
    "Kerala": ["Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"],
    "Madhya Pradesh": ["Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani", "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", "Datia", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda", "Hoshangabad", "Indore", "Jabalpur", "Jhabua", "Katni", "Khandwa", "Khargone", "Mandla", "Mandsaur", "Morena", "Narsinghpur", "Neemuch", "Panna", "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol", "Shajapur", "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", "Umaria", "Vidisha"],
    "Maharashtra": ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"],
    "Manipur": ["Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", "Jiribam", "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl", "Senapati", "Tamenglong", "Tengnoupal", "Thoubal", "Ukhrul"],
    "Meghalaya": ["East Garo Hills", "East Jaintia Hills", "East Khasi Hills", "North Garo Hills", "Ri Bhoi", "South Garo Hills", "South West Garo Hills", "South West Khasi Hills", "West Garo Hills", "West Jaintia Hills", "West Khasi Hills"],
    "Mizoram": ["Aizawl", "Champhai", "Kolasib", "Lawngtlai", "Lunglei", "Mamit", "Saiha", "Serchhip"],
    "Nagaland": ["Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", "Peren", "Phek", "Tuensang", "Wokha", "Zunheboto"],
    "Odisha": ["Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar", "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur", "Sonepur", "Sundargarh"],
    "Punjab": ["Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Mansa", "Moga", "Muktsar", "Pathankot", "Patiala", "Rupnagar", "Sahibzada Ajit Singh Nagar", "Sangrur", "Shahid Bhagat Singh Nagar", "Sri Muktsar Sahib", "Tarn Taran"],
    "Rajasthan": ["Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"],
    "Sikkim": ["East Sikkim", "North Sikkim", "South Sikkim", "West Sikkim"],
    "Tamil Nadu": ["Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kancheepuram", "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"],
    "Telangana": ["Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Jangaon", "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar", "Khammam", "Kumuram Bheem", "Mahabubabad", "Mahabubnagar", "Mancherial", "Medak", "Medchal", "Mulugu", "Nagarkurnool", "Nalgonda", "Narayanpet", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Rangareddy", "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", "Warangal Rural", "Warangal Urban", "Yadadri Bhuvanagiri"],
    "Tripura": ["Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", "Unakoti", "West Tripura"],
    "Uttar Pradesh": ["Agra", "Aligarh", "Allahabad", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", "Faizabad", "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Kheri", "Kushinagar", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "RaeBareli", "Rampur", "Saharanpur", "Sambhal", "Sant Kabir Nagar", "Shahjahanpur", "Shamli", "Shravasti", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"],
    "Uttarakhand": ["Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi"],
    "West Bengal": ["Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur", "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", "Kalimpong", "Kolkata", "Malda", "Murshidabad", "Nadia", "North 24 Parganas", "Paschim Bardhaman", "Paschim Medinipur", "Purba Bardhaman", "Purba Medinipur", "Purulia", "South 24 Parganas", "Uttar Dinajpur"],
    "Andaman and Nicobar Islands": ["Nicobar", "North and Middle Andaman", "South Andaman"],
    "Chandigarh": ["Chandigarh"],
    "Dadra and Nagar Haveli and Daman and Diu": ["Dadra and Nagar Haveli", "Daman", "Diu"],
    "Lakshadweep": ["Lakshadweep"],
    "Delhi": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"],
    "Puducherry": ["Karaikal", "Mahe", "Puducherry", "Yanam"],
    "Ladakh": ["Kargil", "Leh"],
    "Jammu and Kashmir": ["Anantnag", "Bandipora", "Baramulla", "Budgam", "Doda", "Ganderbal", "Jammu", "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Poonch", "Pulwama", "Rajouri", "Ramban", "Reasi", "Samba", "Shopian", "Srinagar", "Udhampur"]
  };

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",

    nationality: "",
    state: "",
    district: "",
    pin: "",
    locality: "",
    postOffice: "",

    school: "",
    qualification: "",
    passingYear: "",

    aadhaarNumber: "",
    panNumber: "",

    aadhaar: null,
    pan: null,
  });

  const handleChange = (e) => {
    const { name, files, value } = e.target;

    if (files && files[0]) {
      const file = files[0];

      setFormData((prev) => ({
        ...prev,
        [name]: file,
      }));

      setUploadedFileName(file.name);
      setUploadPopup(true);

      setTimeout(() => {
        setUploadPopup(false);
      }, 2500);
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const fetchLocationByPin = async (pin) => {
    if (pin.length !== 6) return;

    try {
      const res = await axios.get(
        `https://api.postalpincode.in/pincode/${pin}`
      );

      const data = res.data[0];

      if (data.Status === "Success") {
        const postOffice = data.PostOffice[0];

        setFormData((prev) => ({
          ...prev,
          nationality: "India",
          state: postOffice.State,
          district: postOffice.District,
          pin: pin,
        }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
          );

          const address = response.data.address;

          const pinCode = address.postcode || "";

          setFormData((prev) => ({
            ...prev,
            nationality: "India",

            state:
              address.state ||
              address.region ||
              "",

            district:
              address.county ||
              address.city_district ||
              "",

            pin: pinCode,
          }));

          if (pinCode) {
            fetchLocationByPin(pinCode);
          }
        } catch (error) {
          console.log(error);
        }
      },
      (error) => {
        console.log(error);
        alert("Location access denied");
      }
    );
  };

  return (
    <>
      <SoftBackdropNew />
      <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-[-120px] left-[-120px] w-[400px] h-[400px] bg-violet-700/30 blur-[140px] rounded-full"></div>

        {/* Upload Popup */}
        {uploadPopup && (
          <div className="fixed top-6 right-6 z-50 animate-[fadeIn_.4s_ease-out]">
            <div className="bg-[#0b1220] border border-violet-500/30 shadow-2xl rounded-2xl px-5 py-4 flex items-start gap-4 min-w-[320px]">
              <CheckCircle2
                className="text-green-400 mt-1"
                size={24}
              />

              <div className="flex-1">
                <h3 className="text-white font-semibold">
                  Upload Successful
                </h3>

                <p className="text-gray-400 text-sm mt-1">
                  {uploadedFileName}
                </p>
              </div>

              <button
                onClick={() => setUploadPopup(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="relative w-full max-w-3xl bg-white/5 backdrop-blur-xl border border-violet-500/20 rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white">
              Code<span className="text-violet-400">Arena</span>
            </h1>

            <p className="text-gray-400 mt-2">
              Complete your account setup
            </p>
          </div>

          {/* Progress Bar */}
          <div className="flex justify-between mb-10">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className={`w-full h-2 mx-1 rounded-full transition-all duration-300 ${step >= item
                  ? "bg-violet-500"
                  : "bg-white/10"
                  }`}
              ></div>
            ))}
          </div>

          {/* FORM */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            {/* ================= BASIC DETAILS ================= */}
            {step === 1 && (
              <>
                <div className="md:col-span-2">
                  <h2 className="text-2xl text-white font-semibold">
                    Basic Details
                  </h2>
                </div>

                {/* First Name */}
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">
                    First Name
                  </label>

                  <div className="h-14 bg-violet-500/30 border border-violet-500/20 rounded-xl flex items-center px-4">
                    <User className="text-violet-400 mr-3" size={18} />

                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="John"
                      className="w-full bg-transparent outline-none text-white"
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">
                    Last Name
                  </label>

                  <div className="h-14 bg-violet-500/30 border border-violet-500/20 rounded-xl flex items-center px-4">
                    <User className="text-violet-400 mr-3" size={18} />

                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Singh"
                      className="w-full bg-transparent outline-none text-white"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-300 mb-2 block">
                    Email Address
                  </label>

                  <div className="h-14 bg-violet-500/30 border border-violet-500/20 rounded-xl flex items-center px-4">
                    <Mail className="text-violet-400 mr-3" size={18} />

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full bg-transparent outline-none text-white"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">
                    Phone Number
                  </label>

                  <div className="h-14 bg-violet-500/30 border border-violet-500/20 rounded-xl flex items-center px-4">
                    <Phone className="text-violet-400 mr-3" size={18} />

                    <input
                      type="tel"
                      name="phone"
                      maxLength="10"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      className="w-full bg-transparent outline-none text-white"
                    />
                  </div>
                </div>

                {/* DOB */}
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">
                    Date of Birth
                  </label>

                  <div className="h-14 bg-violet-500/30 border border-violet-500/20 rounded-xl flex items-center px-4">
                    <Calendar className="text-violet-400 mr-3" size={18} />

                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      className="w-full bg-transparent outline-none text-white"
                    />
                  </div>
                </div>
              </>
            )}

            {/* ================= ADDRESS DETAILS ================= */}
            {step === 2 && (
              <>
                <div className="md:col-span-2">
                  <h2 className="text-2xl text-white font-semibold">
                    Address Details
                  </h2>
                </div>

                {/* Nationality */}
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">
                    Nationality
                  </label>

                  <select
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    className="w-full h-14 bg-violet-500/30 border border-violet-500/20 rounded-xl px-4 text-white outline-none"
                  >
                    <option value="" className="bg-black text-white">Select Nationality</option>
                    <option value="India" className="bg-black text-white">Indian</option>
                  </select>
                </div>

                {/* State */}
                {formData.nationality === "India" && (
                  <div>
                    <label className="text-sm text-gray-300 mb-2 block">
                      State
                    </label>

                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full h-14 bg-violet-500/30 border border-violet-500/20 rounded-xl px-4 text-white outline-none"
                    >
                      <option value="" className="bg-black text-white">Select State</option>

                      {Object.keys(indianStates).map((state) => (
                        <option key={state} value={state} className="bg-black text-white">
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* District */}
                {formData.state && (
                  <div>
                    <label className="text-sm text-gray-300 mb-2 block">
                      District
                    </label>

                    <select
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      className="w-full h-14 bg-violet-500/30 border border-violet-500/20 rounded-xl px-4 text-white outline-none"
                    >
                      <option value="" className="bg-black text-white">Select District</option>

                      {indianStates[formData.state].map((district) => (
                        <option key={district} value={district} className="bg-black text-white">
                          {district}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* PIN */}
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">
                    PIN Code
                  </label>

                  <div className="relative">
                    <input
                      type="text"
                      name="pin"
                      maxLength="6"
                      value={formData.pin}
                      onChange={(e) => {
                        handleChange(e);
                        fetchLocationByPin(e.target.value);
                      }}
                      placeholder="712410"
                      className="w-full h-14 bg-violet-500/30 border border-violet-500/20 rounded-xl px-4 text-white outline-none"
                    />

                    <button
                      type="button"
                      onClick={detectLocation}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-100 hover:text-violet-300"
                    >
                      <LocateFixed size={20} />
                    </button>
                  </div>

                  <p className="text-gray-500 text-xs mt-2 flex items-center gap-1">
                    <MapPin size={14} />
                    Enter PIN or use GPS location
                  </p>
                </div>

                {/* Locality */}
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">
                    Locality
                  </label>

                  <input
                    type="text"
                    name="locality"
                    value={formData.locality}
                    onChange={handleChange}
                    placeholder="Village / Town"
                    className="w-full h-14 bg-violet-500/30 border border-violet-500/20 rounded-xl px-4 text-white outline-none"
                  />
                </div>

                {/* Post Office */}
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-300 mb-2 block">
                    Post Office
                  </label>

                  <input
                    type="text"
                    name="postOffice"
                    value={formData.postOffice}
                    onChange={handleChange}
                    placeholder="Post Office"
                    className="w-full h-14 bg-violet-500/30 border border-violet-500/20 rounded-xl px-4 text-white outline-none"
                  />
                </div>
              </>
            )}

            {/* ================= EDUCATION DETAILS ================= */}
            {step === 3 && (
              <>
                <div className="md:col-span-2">
                  <h2 className="text-2xl text-white font-semibold">
                    Education Details
                  </h2>
                </div>

                {/* School */}
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-300 mb-2 block">
                    School / College Name
                  </label>

                  <div className="h-14 bg-violet-500/30 border border-violet-500/20 rounded-xl flex items-center px-4">
                    <GraduationCap
                      className="text-violet-400 mr-3"
                      size={18}
                    />

                    <input
                      type="text"
                      name="school"
                      value={formData.school}
                      onChange={handleChange}
                      placeholder="Your Institution"
                      className="w-full bg-transparent outline-none text-white"
                    />
                  </div>
                </div>

                {/* Qualification */}
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">
                    Qualification
                  </label>

                  <input
                    type="text"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    placeholder="BCA / HS / Diploma"
                    className="w-full h-14 bg-violet-500/30 border border-violet-500/20 rounded-xl px-4 text-white outline-none"
                  />
                </div>

                {/* Passing Year */}
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">
                    Passing Year
                  </label>

                  <input
                    type="text"
                    name="passingYear"
                    value={formData.passingYear}
                    onChange={handleChange}
                    placeholder="2025"
                    className="w-full h-14 bg-violet-500/30 border border-violet-500/20 rounded-xl px-4 text-white outline-none"
                  />
                </div>
              </>
            )}

            {/* ================= DOCUMENT UPLOAD ================= */}
            {step === 4 && (
              <>
                <div className="md:col-span-2">
                  <h2 className="text-2xl text-white font-semibold">
                    Documents
                  </h2>
                </div>

                {/* Aadhaar Section */}
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">
                    Aadhaar Number
                  </label>

                  <div className="h-14 bg-violet-500/20 border border-violet-500/20 rounded-xl flex items-center px-4 mb-4 backdrop-blur-md">
                    <input
                      type="text"
                      name="aadhaarNumber"
                      value={formData.aadhaarNumber}
                      onChange={(e) => {
                        let value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 12);

                        value = value.replace(
                          /(\d{4})(\d{4})(\d{0,4})/,
                          (_, p1, p2, p3) =>
                            [p1, p2, p3].filter(Boolean).join(" ")
                        );

                        setFormData({
                          ...formData,
                          aadhaarNumber: value,
                        });
                      }}
                      placeholder="1234 5678 9012"
                      className="w-full bg-transparent outline-none text-white tracking-[3px] placeholder:text-gray-400"
                    />
                  </div>

                  <label className="text-sm text-gray-300 mb-2 block">
                    Upload Aadhaar
                  </label>

                  <label className="relative overflow-hidden w-full h-44 bg-violet-500/10 border border-dashed border-violet-500/30 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-violet-400 hover:bg-violet-500/20 transition-all duration-300">

                    {formData.aadhaar ? (
                      <>
                        {formData.aadhaar.type.startsWith("image/") ? (
                          <img
                            src={URL.createObjectURL(formData.aadhaar)}
                            alt="aadhaar"
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center">
                            <FileText
                              className="text-violet-300 mb-2"
                              size={45}
                            />

                            <p className="text-white text-sm text-center px-3">
                              {formData.aadhaar.name}
                            </p>
                          </div>
                        )}

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-all duration-300 flex items-center justify-center">

                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();

                              setPreviewFile(
                                URL.createObjectURL(formData.aadhaar)
                              );

                              setPreviewType(formData.aadhaar.type);
                            }}
                            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-semibold shadow-lg shadow-violet-500/30 hover:scale-105 transition-all duration-300"
                          >
                            Preview
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <Upload className="text-violet-400 mb-2" size={28} />

                        <span className="text-gray-300 text-sm">
                          Click to upload
                        </span>
                      </>
                    )}

                    <input
                      type="file"
                      name="aadhaar"
                      accept="image/*,.pdf"
                      onChange={handleChange}
                      hidden
                    />
                  </label>

                  {formData.aadhaar && (
                    <div className="mt-3 bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-center gap-3 animate-[fadeIn_0.4s_ease]">
                      <CheckCircle2
                        className="text-green-400"
                        size={22}
                      />

                      <div>
                        <p className="text-white text-sm font-medium">
                          {formData.aadhaar.name}
                        </p>

                        <p className="text-green-300 text-xs">
                          Document Uploaded Successfully
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* PAN Section */}
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">
                    PAN Number
                  </label>

                  <div className="h-14 bg-violet-500/20 border border-violet-500/20 rounded-xl flex items-center px-4 mb-4 backdrop-blur-md">
                    <input
                      type="text"
                      name="panNumber"
                      value={formData.panNumber}
                      onChange={(e) => {
                        let value = e.target.value
                          .toUpperCase()
                          .replace(/[^A-Z0-9]/g, "")
                          .slice(0, 10);

                        setFormData({
                          ...formData,
                          panNumber: value,
                        });
                      }}
                      placeholder="ABCDE1234F"
                      className="w-full bg-transparent outline-none text-white tracking-[3px] placeholder:text-gray-400"
                    />
                  </div>

                  <label className="text-sm text-gray-300 mb-2 block">
                    Upload PAN
                  </label>

                  <label className="relative overflow-hidden w-full h-44 bg-violet-500/10 border border-dashed border-violet-500/30 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-violet-400 hover:bg-violet-500/20 transition-all duration-300">

                    {formData.pan ? (
                      <>
                        {formData.pan.type.startsWith("image/") ? (
                          <img
                            src={URL.createObjectURL(formData.pan)}
                            alt="pan"
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center">
                            <FileText
                              className="text-violet-300 mb-2"
                              size={45}
                            />

                            <p className="text-white text-sm text-center px-3">
                              {formData.pan.name}
                            </p>
                          </div>
                        )}

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-all duration-300 flex items-center justify-center">

                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();

                              setPreviewFile(
                                URL.createObjectURL(formData.pan)
                              );

                              setPreviewType(formData.pan.type);
                            }}
                            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-semibold shadow-lg shadow-violet-500/30 hover:scale-105 transition-all duration-300"
                          >
                            Preview
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <Upload className="text-violet-400 mb-2" size={28} />

                        <span className="text-gray-300 text-sm">
                          Click to upload
                        </span>
                      </>
                    )}

                    <input
                      type="file"
                      name="pan"
                      accept="image/*,.pdf"
                      onChange={handleChange}
                      hidden
                    />
                  </label>

                  {formData.pan && (
                    <div className="mt-3 bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-center gap-3 animate-[fadeIn_0.4s_ease]">
                      <CheckCircle2
                        className="text-green-400"
                        size={22}
                      />

                      <div>
                        <p className="text-white text-sm font-medium">
                          {formData.pan.name}
                        </p>

                        <p className="text-green-300 text-xs">
                          Document Uploaded Successfully
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Preview Modal */}
                {previewFile && (
                  <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">

                    <div className="relative w-full max-w-5xl h-[90vh] bg-[#0f172a] rounded-3xl overflow-hidden border border-violet-500/30 shadow-2xl">

                      {/* Close Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewFile(null);
                          setPreviewType("");
                        }}
                        className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-red-500 text-white p-2 rounded-full transition-all"
                      >
                        <X size={22} />
                      </button>

                      {/* Preview Content */}
                      <div className="w-full h-full flex items-center justify-center bg-black">

                        {previewType.includes("pdf") ? (
                          <iframe
                            src={previewFile}
                            title="Document Preview"
                            className="w-full h-full"
                          />
                        ) : (
                          <img
                            src={previewFile}
                            alt="Preview"
                            className="max-w-full max-h-full object-contain"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Buttons */}
            <div className="md:col-span-2 flex justify-between mt-4">
              <div className="flex gap-3">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="px-6 h-12 rounded-xl border border-violet-500/20 text-white hover:bg-violet-500/10 transition"
                  >
                    Back
                  </button>
                )}

                {/* Skip Button Only Step 1 */}
                {step === 1 && (
                  <a href="/" >
                    <button
                      type="button"
                      onClick={() => navigate("/")}
                      className="px-6 h-12 rounded-xl border border-gray-500/20 text-gray-300 hover:bg-white/5 transition"
                    >
                      Skip Now
                    </button>
                  </a>

                )}
              </div>

              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => setStep((prev) => prev + 1)}
                  className="ml-auto px-8 h-12 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-semibold shadow-lg shadow-violet-500/20"
                >
                  Next →
                </button>
              ) : (
                <button
                  type="submit"
                  className="ml-auto px-8 h-12 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-semibold shadow-lg shadow-violet-500/20"
                >
                  Complete Registration →
                </button>
              )}
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 bg-violet-500/5 border border-violet-500/20 rounded-2xl p-4">
            <p className="text-violet-400 font-medium mb-1">
              Secure Registration
            </p>

            <p className="text-gray-400 text-sm">
              Your information is encrypted and securely stored.
            </p>
          </div>
        </div>
      </div></>
  );
}