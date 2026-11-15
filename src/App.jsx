// import { Routes, Route } from "react-router-dom";

// import MainLayout from "./components/layout/MainLayout";
// import Home from "./pages/Home/Home";
// import BookAppointment from "./pages/BookAppointment/BookAppointment";
// import FindDoctors from "./pages/FindDoctors/FindDoctors";
// import Specialties from "./pages/Specialties/Specialties";
// import Hospitals from "./pages/Hospitals/Hospitals";
// import About from "./pages/About/About";
// import Login from "./pages/Login/Login";

// import "./App.css";
// import Signup from "./pages/Signup/Signup";
// import BloodDonation from "./pages/BloodDonation/BloodDonation";
// import ListYourClinic from "./pages/ListYourClinic/ListYourClinic";
// import BecomeDonor from "./pages/BloodDonation/BecomeDonor";
// import HospitalDetails from "./pages/HospitalDetails/HospitalDetails";

// // const App = () => {
// //   return (
// //     <MainLayout>
// //       <Routes>
// //         <Route path="/" element={<Home />} />
// //         <Route
// //           path="/book-appointment"
// //           element={<BookAppointment />}
// //         />
// //         <Route path="/find-doctors" element={<FindDoctors />} />
// //         <Route path="/specialties" element={<Specialties />} />
// //         <Route path="/hospitals" element={<Hospitals />} />
// //         <Route path="/about" element={<About />} />
// //         <Route path="/hospitals/:id" element={<HospitalDetails />} />
// //         <Route path="/donate-blood" element={<BloodDonation/>} />
// //         <Route path="/become-donor" element={<BecomeDonor />} />
// //         <Route path="/list-your-clinic" element={<ListYourClinic/>}/>
// //         <Route path="/signup" element={<Signup />} />
// //         <Route path="/login" element={<Login />} />
// //       </Routes>
// //     </MainLayout>
// //   );
// // };

// // export default App;




// /* ---------- Blood donation flow ---------- */
// import FindDonors from "./pages/BloodDonation/FindDonors";
// import RequestBlood from "./pages/BloodDonation/RequestBlood";
// import BloodRequestSuccess from "./pages/BloodDonation/BloodRequestSuccess";

// /* ---------- 404 ---------- */
// import NotFound from "./pages/NotFound/NotFound";

// const App = () => {
//   return (
//     <MainLayout>
//       <Routes>
//         {/* ---------- General ---------- */}
//         <Route path="/" element={<Home />} />
//         <Route path="/book-appointment" element={<BookAppointment />} />
//         <Route path="/find-doctors" element={<FindDoctors />} />
//         <Route path="/specialties" element={<Specialties />} />
//         <Route path="/hospitals" element={<Hospitals />} />
//         <Route path="/hospitals/:id" element={<HospitalDetails />} />
//         <Route path="/about" element={<About />} />
//         <Route path="/list-your-clinic" element={<ListYourClinic />} />

//         {/* ---------- Blood donation ---------- */}
//         <Route path="/donate-blood" element={<BloodDonation />} />
//         <Route path="/donate-blood/become-donor" element={<BecomeDonor />} />
//         <Route path="/donate-blood/find-donors" element={<FindDonors />} />
//         <Route path="/donate-blood/request" element={<RequestBlood />} />
//         <Route path="/donate-blood/request/success" element={<BloodRequestSuccess />} />

//         {/* ---------- Auth ---------- */}
//         <Route path="/signup" element={<Signup />} />
//         <Route path="/login" element={<Login />} />

//         {/* ---------- Fallback ---------- */}
//         <Route path="*" element={<NotFound />} />
//       </Routes>
//     </MainLayout>
//   );
// };

// export default App;

// src/App.jsx
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";

/* ---------- General ---------- */
import Home from "./pages/Home/Home";
import BookAppointment from "./pages/BookAppointment/BookAppointment";
import FindDoctors from "./pages/FindDoctors/FindDoctors";
import Specialties from "./pages/Specialties/Specialties";
import Hospitals from "./pages/Hospitals/Hospitals";
import HospitalDetails from "./pages/HospitalDetails/HospitalDetails";
import DoctorProfile from "./pages/DoctorProfile/DoctorProfile";
import About from "./pages/About/About";
import ListYourClinic from "./pages/ListYourClinic/ListYourClinic";



/* ---------- Blood donation flow ---------- */
import BloodDonation from "./pages/BloodDonation/BloodDonation";
import BecomeDonor from "./pages/BloodDonation/BecomeDonor";
import FindDonors from "./pages/BloodDonation/FindDonors";
import RequestBlood from "./pages/BloodDonation/RequestBlood";
import BloodRequestSuccess from "./pages/BloodDonation/BloodRequestSuccess";
import RegisterDonorForm from "./pages/BloodDonation/RegisterDonorForm";

/* ---------- Auth ---------- */
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";

/* ---------- 404 ---------- */
import NotFound from "./pages/NotFound/NotFound";

import "./App.css";

/* ------------------------------------------------------------------ */
/*  RequestBloodSuccessPage                                            */
/*  Wraps BloodRequestSuccess with state from navigation. If the user  */
/*  lands here without state (refresh, direct link), it falls back to  */
/*  the request form so they don't see garbage placeholder data.       */
/* ------------------------------------------------------------------ */
function RequestBloodSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};

  if (!state.requestId) {
    return <Navigate to="/donate-blood/request" replace />;
  }

  return (
    <BloodRequestSuccess
      requestId={state.requestId}
      bloodGroup={state.bloodGroup}
      units={Number(state.units || 1)}
      patientName={state.patientName}
      hospitalName={state.hospitalName}
      city={state.city}
      submittedAt={state.submittedAt}
      contactPhone={state.contactPhone}
      contactEmail={state.contactEmail || "help@nearbydoctor.in"}
      onViewRequest={() => navigate("/donate-blood/my-requests")}
      onGoHome={() => navigate("/")}
      onShare={(payload) => {
        // optional: hook up to your share API / analytics here
        if (navigator.share) {
          navigator.share({
            title: "Blood request",
            text: `Urgent: ${payload.bloodGroup} blood needed in ${payload.city}. ID: ${payload.requestId}`,
          }).catch(() => {});
        }
      }}
    />
  );
}

const App = () => {
  return (
    <MainLayout>
      <Routes>
        {/* ---------- General ---------- */}
        <Route path="/" element={<Home />} />
        <Route path="/book-appointment" element={<BookAppointment />} />
        <Route path="/find-doctors" element={<FindDoctors />} />
        <Route path="/specialties" element={<Specialties />} />
        <Route path="/hospitals" element={<Hospitals />} />
        <Route path="/hospitals/:id" element={<HospitalDetails />} />
        <Route path="/doctors/:id" element={<DoctorProfile />} />
        <Route path="/about" element={<About />} />
        <Route path="/list-your-clinic" element={<ListYourClinic />} />

        {/* ---------- Blood donation ---------- */}
        <Route path="/donate-blood" element={<BloodDonation />} />
        <Route path="/donate-blood/become-donor" element={<BecomeDonor />} />
        <Route path="/donate-blood/register" element={<RegisterDonorForm />} />
        <Route path="/donate-blood/find-donors" element={<FindDonors />} />
        <Route path="/donate-blood/request" element={<RequestBlood />} />
        <Route path="/donate-blood/request/success" element={<RequestBloodSuccessPage />} />


        {/* Legacy redirect: /become-donor → /donate-blood/become-donor */}
        <Route path="/become-donor" element={<Navigate to="/donate-blood/become-donor" replace />} />

        {/* ---------- Auth ---------- */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* ---------- Fallback ---------- */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </MainLayout>
  );
};

export default App;