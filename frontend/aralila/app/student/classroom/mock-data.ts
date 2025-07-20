// Enhanced mock data with scores and extended dates


// This file contains mock data for the classroom page to demonstrate scrolling.

// A simple function to get a random generic avatar
const genericAvatars = [
    "/images/avatars/generic-avatar-1.png",
    "/images/avatars/generic-avatar-2.png",
    "/images/avatars/generic-avatar-3.png",
    "/images/avatars/generic-avatar-4.png",
];
const getRandomAvatar = () => genericAvatars[Math.floor(Math.random() * genericAvatars.length)];

export const classroomData = {
    name: "Grade 7 - Filipino",
    teacher: {
        name: "Bb. Elena Santos",
        avatar: "/images/avatars/teacher-avatar.png",
    },
    activities: [
        { id: 1, type: "Assignment", title: "Pagsusuri ng Maikling Kwento", dueDate: "Hulyo 22, 2025" },
        { id: 2, type: "Material", title: "Kabanata 1: Panimula sa Panitikan", dueDate: null },
        { id: 3, type: "Quiz", title: "Pagsusulit 1: Mga Uri ng Panitikan", dueDate: "Hulyo 25, 2025" },
        { id: 4, type: "Project", title: "Paglikha ng Sariling Tula", dueDate: "Agosto 15, 2025" },
        { id: 5, type: "Assignment", title: "Pagsasanay sa Gramatika: Wastong Gamit ng Panghalip", dueDate: "Hulyo 29, 2025" },
        { id: 6, type: "Material", title: "Video Lektura: Ang Paggamit ng Tayutay", dueDate: null },
        { id: 7, type: "Assignment", title: "Sanaysay Tungkol sa Kulturang Pilipino", dueDate: "Agosto 05, 2025" },
        { id: 8, type: "Quiz", title: "Pagsusulit 2: Mga Bahagi ng Pananalita", dueDate: "Agosto 08, 2025" },
        { id: 9, type: "Material", title: "Mga Tala sa Salawikain at Kasabihan", dueDate: null },
        { id: 10, type: "Assignment", title: "Pagbuo ng Dayalogo", dueDate: "Agosto 12, 2025" },
        { id: 11, type: "Review", title: "Gabay sa Pag-aaral para sa Midterm", dueDate: null },
        { id: 12, type: "Exam", title: "Midterm na Pagsusulit", dueDate: "Agosto 19, 2025" },
    ],
    discussions: [
        { id: 1, author: "Bb. Elena Santos", avatar: "/images/avatars/teacher-avatar.png", message: "Maligayang pagdating sa Filipino 7! Nai-post ko na ang syllabus at unang materyal sa pagbabasa sa 'Mga Gawain' na tab. Pakitingnan bago ang ating unang sesyon.", timestamp: "5 araw na nakalipas" },
        { id: 2, author: "Bb. Elena Santos", avatar: "/images/avatars/teacher-avatar.png", message: "Isang paalala lamang na ang unang takdang-aralin sa Panitikan ay sa Martes. Ang aking virtual office hours ay Lunes mula 3-5 PM kung mayroon kayong mga katanungan.", timestamp: "3 araw na nakalipas" },
        { id: 3, author: "Alexandra dela Cruz", avatar: "/images/avatars/student-avatar.png", message: "Para po sa proyekto, pwede po bang magkapares?", timestamp: "2 araw na nakalipas" },
        { id: 4, author: "Bb. Elena Santos", avatar: "/images/avatars/teacher-avatar.png", message: "Magandang tanong, Alex. Oo, maaari kayong magkapares para sa proyekto. Pakisumite lamang ang isang ulat bawat pares na may parehong pangalan ninyo.", timestamp: "2 araw na nakalipas" },
        { id: 5, author: "Bb. Elena Santos", avatar: "/images/avatars/teacher-avatar.png", message: "In-upload ko lang ang isang video lecture tungkol sa Paggamit ng Tayutay upang makatulong sa mga paksa ngayong linggo. Mahahanap ninyo ito sa 'Mga Gawain'.", timestamp: "1 araw na nakalipas" },
    ],
    people: [
        { id: 't1', name: "Bb. Elena Santos", role: "Guro", avatar: "/images/avatars/teacher-avatar.png" },
        { id: 's1', name: "Alexandra dela Cruz", role: "Mag-aaral", avatar: "/images/avatars/student-avatar.png" },
        { id: 's2', name: "Benjamin Carter", role: "Mag-aaral", avatar: getRandomAvatar() },
        { id: 's3', name: "Chloe Zhao", role: "Mag-aaral", avatar: getRandomAvatar() },
        { id: 's4', name: "David Rodriguez", role: "Mag-aaral", avatar: getRandomAvatar() },
        { id: 's5', name: "Emily White", role: "Mag-aaral", avatar: getRandomAvatar() },
        { id: 's6', name: "Finn O'Connell", role: "Mag-aaral", avatar: getRandomAvatar() },
        { id: 's7', name: "Grace Kim", role: "Mag-aaral", avatar: getRandomAvatar() },
        { id: 's8', name: "Henry Williams", role: "Mag-aaral", avatar: getRandomAvatar() },
        { id: 's9', name: "Isabella Jones", role: "Mag-aaral", avatar: getRandomAvatar() },
        { id: 's10', name: "Jacob Miller", role: "Mag-aaral", avatar: getRandomAvatar() },
        { id: 's11', name: "Kenji Tanaka", role: "Mag-aaral", avatar: getRandomAvatar() },
        { id: 's12', name: "Liam Smith", role: "Mag-aaral", avatar: getRandomAvatar() },
        { id: 's13', name: "Maria Garcia", role: "Mag-aaral", avatar: getRandomAvatar() },
        { id: 's14', name: "Noah Brown", role: "Mag-aaral", avatar: getRandomAvatar() },
        { id: 's15', name: "Olivia Davis", role: "Mag-aaral", avatar: getRandomAvatar() },
    ],
};