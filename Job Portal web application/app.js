"use strict";
// Global state
let allJobs = [];
let savedJobIds = [];
let appliedJobIds = [];
let currentPage = 1;
const jobsPerPage = 6;
let currentSearchTerm = "";
let currentCompanyFilter = "all";
let currentRoleFilter = "all";
// DOM elements
const jobsContainer = document.getElementById("jobsContainer");
const searchInput = document.getElementById("searchInput");
const companyFilter = document.getElementById("companyFilter");
const roleFilter = document.getElementById("roleFilter");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const pageIndicator = document.getElementById("pageIndicator");
const savedJobsList = document.getElementById("savedJobsList");
const savedCountSpan = document.getElementById("savedCount");
const clearSavedBtn = document.getElementById("clearSavedBtn");
const darkModeToggle = document.getElementById("darkModeToggle");
const loadingSpinner = document.getElementById("loadingSpinner");
const applyModal = document.getElementById("applyModal");
const modalJobTitle = document.getElementById("modalJobTitle");
const modalCompanyName = document.getElementById("modalCompanyName");
const applyForm = document.getElementById("applyForm");
const closeModalBtn = document.querySelector(".close-modal");
const cancelModalBtn = document.querySelector(".cancel-modal-btn");
// Helper: show toast
function showToast(message, duration = 3000) {
    const toastContainer = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerText = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
}
// Mock API: fetch jobs (simulate network delay)
async function fetchMockJobs() {
    return new Promise((resolve) => {
        setTimeout(() => {
            const mockData = [
                { id: 1, title: "Frontend Developer", company: "TechCorp", salary: "$75k - $95k", location: "Remote", role: "Developer", logo: "https://ui-avatars.com/api/?background=3b82f6&color=fff&name=TC" },
                { id: 2, title: "UI/UX Designer", company: "CreativeStudio", salary: "$65k - $85k", location: "New York", role: "Designer", logo: "https://ui-avatars.com/api/?background=10b981&color=fff&name=CS" },
                { id: 3, title: "Product Manager", company: "InnovateLabs", salary: "$95k - $120k", location: "San Francisco", role: "Manager", logo: "https://ui-avatars.com/api/?background=f59e0b&color=fff&name=IL" },
                { id: 4, title: "Backend Engineer", company: "DataSys", salary: "$85k - $105k", location: "Austin", role: "Developer", logo: "https://ui-avatars.com/api/?background=ef4444&color=fff&name=DS" },
                { id: 5, title: "Marketing Specialist", company: "BrandBoost", salary: "$55k - $70k", location: "Chicago", role: "Marketing", logo: "https://ui-avatars.com/api/?background=8b5cf6&color=fff&name=BB" },
                { id: 6, title: "Sales Executive", company: "SalesHub", salary: "$60k - $80k", location: "Remote", role: "Sales", logo: "https://ui-avatars.com/api/?background=ec489a&color=fff&name=SH" },
                { id: 7, title: "React Developer", company: "WebWizards", salary: "$80k - $100k", location: "Seattle", role: "Developer", logo: "https://ui-avatars.com/api/?background=06b6d4&color=fff&name=WW" },
                { id: 8, title: "Graphic Designer", company: "Artisan", salary: "$50k - $65k", location: "Portland", role: "Designer", logo: "https://ui-avatars.com/api/?background=14b8a6&color=fff&name=AR" },
                { id: 9, title: "Project Manager", company: "BuildIT", salary: "$90k - $110k", location: "Boston", role: "Manager", logo: "https://ui-avatars.com/api/?background=6366f1&color=fff&name=BI" },
                { id: 10, title: "DevOps Engineer", company: "CloudNative", salary: "$100k - $130k", location: "Remote", role: "Developer", logo: "https://ui-avatars.com/api/?background=0ea5e9&color=fff&name=CN" },
                { id: 11, title: "Motion Designer", company: "PixelWave", salary: "$70k - $90k", location: "Los Angeles", role: "Designer", logo: "https://ui-avatars.com/api/?background=d946ef&color=fff&name=PW" },
                { id: 12, title: "Engineering Manager", company: "ScaleUp", salary: "$120k - $150k", location: "New York", role: "Manager", logo: "https://ui-avatars.com/api/?background=f97316&color=fff&name=SU" },
                { id: 13, title: "Full Stack Developer", company: "StackLab", salary: "$85k - $105k", location: "Denver", role: "Developer", logo: "https://ui-avatars.com/api/?background=84cc16&color=fff&name=SL" },
                { id: 14, title: "Content Designer", company: "StoryCo", salary: "$60k - $75k", location: "Remote", role: "Designer", logo: "https://ui-avatars.com/api/?background=06b6d4&color=fff&name=SC" },
                { id: 15, title: "Sales Manager", company: "LeadGen", salary: "$85k - $105k", location: "Miami", role: "Manager", logo: "https://ui-avatars.com/api/?background=3b82f6&color=fff&name=LG" },
                { id: 16, title: "Python Developer", company: "AI Solutions", salary: "$90k - $115k", location: "Austin", role: "Developer", logo: "https://ui-avatars.com/api/?background=10b981&color=fff&name=AI" },
                { id: 17, title: "Brand Designer", company: "IdentityCo", salary: "$65k - $80k", location: "Portland", role: "Designer", logo: "https://ui-avatars.com/api/?background=f59e0b&color=fff&name=IC" },
                { id: 18, title: "Tech Lead", company: "CodeWorks", salary: "$110k - $140k", location: "Seattle", role: "Manager", logo: "https://ui-avatars.com/api/?background=ef4444&color=fff&name=CW" },
            ];
            resolve(mockData);
        }, 800);
    });
}
// Load saved jobs from localStorage
function loadSavedJobs() {
    const stored = localStorage.getItem("savedJobs");
    savedJobIds = stored ? JSON.parse(stored) : [];
}
// Load applied jobs from localStorage
function loadAppliedJobs() {
    const stored = localStorage.getItem("appliedJobs");
    appliedJobIds = stored ? JSON.parse(stored) : [];
}
// Save applied jobs to localStorage
function persistAppliedJobs() {
    localStorage.setItem("appliedJobs", JSON.stringify(appliedJobIds));
}
// Save to localStorage
function persistSavedJobs() {
    localStorage.setItem("savedJobs", JSON.stringify(savedJobIds));
    renderSavedJobsList();
    updateJobCardsBookmarkState();
    updateSavedCount();
}
// Toggle save/unsave job
function toggleSaveJob(jobId) {
    const index = savedJobIds.indexOf(jobId);
    if (index === -1) {
        savedJobIds.push(jobId);
        showToast("✅ Job saved!");
    }
    else {
        savedJobIds.splice(index, 1);
        showToast("❌ Job removed from saved");
    }
    persistSavedJobs();
}
// Render saved jobs sidebar
function renderSavedJobsList() {
    const savedJobs = allJobs.filter(job => savedJobIds.includes(job.id));
    if (savedJobs.length === 0) {
        savedJobsList.innerHTML = `<div class="empty-saved">No saved jobs yet. Click ♡ on any job card.</div>`;
        return;
    }
    savedJobsList.innerHTML = savedJobs.map(job => `
    <div class="saved-job-item" data-job-id="${job.id}">
      <div class="saved-job-info">
        <h4>${job.title}</h4>
        <p>${job.company} • ${job.location}</p>
      </div>
      <button class="remove-saved" data-id="${job.id}"><i class="fas fa-times-circle"></i></button>
    </div>
  `).join("");
    document.querySelectorAll(".remove-saved").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const id = parseInt(btn.getAttribute("data-id"));
            toggleSaveJob(id);
        });
    });
}
function updateSavedCount() {
    savedCountSpan.innerText = `(${savedJobIds.length})`;
}
function updateJobCardsBookmarkState() {
    document.querySelectorAll(".save-btn").forEach(btn => {
        const jobId = parseInt(btn.getAttribute("data-id"));
        if (savedJobIds.includes(jobId)) {
            btn.classList.add("saved");
            const icon = btn.querySelector("i");
            if (icon)
                icon.className = "fas fa-heart";
        }
        else {
            btn.classList.remove("saved");
            const icon = btn.querySelector("i");
            if (icon)
                icon.className = "far fa-heart";
        }
    });
}
// Filter jobs based on search, company, role
function getFilteredJobs() {
    let filtered = [...allJobs];
    if (currentSearchTerm.trim() !== "") {
        const term = currentSearchTerm.toLowerCase();
        filtered = filtered.filter(job => job.title.toLowerCase().includes(term) ||
            job.company.toLowerCase().includes(term) ||
            job.location.toLowerCase().includes(term));
    }
    if (currentCompanyFilter !== "all") {
        filtered = filtered.filter(job => job.company === currentCompanyFilter);
    }
    if (currentRoleFilter !== "all") {
        filtered = filtered.filter(job => job.role === currentRoleFilter);
    }
    return filtered;
}
// Render paginated jobs
function renderJobs() {
    const filtered = getFilteredJobs();
    const totalPages = Math.ceil(filtered.length / jobsPerPage);
    if (currentPage > totalPages && totalPages > 0)
        currentPage = totalPages;
    if (currentPage < 1)
        currentPage = 1;
    const start = (currentPage - 1) * jobsPerPage;
    const paginatedJobs = filtered.slice(start, start + jobsPerPage);
    if (paginatedJobs.length === 0) {
        jobsContainer.innerHTML = `<div class="empty-jobs" style="grid-column:1/-1; text-align:center; padding:3rem;">No jobs match your filters.</div>`;
    }
    else {
        jobsContainer.innerHTML = paginatedJobs.map(job => `
      <div class="job-card" data-job-id="${job.id}">
        <div class="card-header">
          <img class="company-logo" src="${job.logo}" alt="${job.company} logo" onerror="this.src='https://via.placeholder.com/50?text=Logo'">
          <div>
            <div class="job-title">${job.title}</div>
            <div class="company-name">${job.company}</div>
          </div>
        </div>
        <div class="job-details">
          <div><i class="fas fa-dollar-sign"></i> ${job.salary}</div>
          <div><i class="fas fa-map-marker-alt"></i> ${job.location}</div>
          <div><i class="fas fa-briefcase"></i> ${job.role}</div>
        </div>
        <div class="card-actions">
          <button class="apply-btn" data-id="${job.id}">Apply Now</button>
          <button class="save-btn" data-id="${job.id}"><i class="far fa-heart"></i></button>
        </div>
      </div>
    `).join("");
    }
    document.querySelectorAll(".apply-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const jobId = parseInt(btn.getAttribute("data-id"));
            const job = allJobs.find(j => j.id === jobId);
            if (job)
                openApplyModal(job);
        });
    });
    document.querySelectorAll(".save-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const jobId = parseInt(btn.getAttribute("data-id"));
            toggleSaveJob(jobId);
        });
    });
    updateJobCardsBookmarkState();
    pageIndicator.innerText = `Page ${currentPage} of ${totalPages || 1}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
}
// Populate company dropdown from allJobs
function populateCompanyFilter() {
    const companies = [...new Set(allJobs.map(job => job.company))].sort();
    companyFilter.innerHTML = '<option value="all">All Companies</option>';
    companies.forEach(company => {
        const option = document.createElement("option");
        option.value = company;
        option.textContent = company;
        companyFilter.appendChild(option);
    });
}
// Modal handlers
let currentApplyJob = null;
function openApplyModal(job) {
    currentApplyJob = job;
    modalJobTitle.innerText = job.title;
    modalCompanyName.innerText = job.company;
    applyModal.style.display = "flex";
    document.getElementById("applicantName").value = "";
    document.getElementById("applicantEmail").value = "";
}
function closeModal() {
    applyModal.style.display = "none";
    applyForm.reset();
}
// Apply form submit - with duplicate check
applyForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("applicantName").value.trim();
    const email = document.getElementById("applicantEmail").value.trim();
    if (!name || !email) {
        showToast("Please fill in both name and email", 2000);
        return;
    }
    if (!currentApplyJob)
        return;
    if (appliedJobIds.includes(currentApplyJob.id)) {
        showToast(`⚠️ You have already applied for ${currentApplyJob.title} at ${currentApplyJob.company}`, 3000);
        closeModal();
        return;
    }
    appliedJobIds.push(currentApplyJob.id);
    persistAppliedJobs();
    showToast(`🎉 Application submitted for ${currentApplyJob.title} at ${currentApplyJob.company}`);
    closeModal();
});
// Dark mode
function initDarkMode() {
    const stored = localStorage.getItem("darkMode");
    if (stored === "true") {
        document.body.classList.add("dark");
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i> <span>Light</span>';
    }
    else {
        darkModeToggle.innerHTML = '<i class="fas fa-moon"></i> <span>Dark</span>';
    }
}
darkModeToggle.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark");
    localStorage.setItem("darkMode", isDark.toString());
    if (isDark) {
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i> <span>Light</span>';
    }
    else {
        darkModeToggle.innerHTML = '<i class="fas fa-moon"></i> <span>Dark</span>';
    }
});
// Event listeners for filters & search
function handleFilterChange() {
    currentSearchTerm = searchInput.value;
    currentCompanyFilter = companyFilter.value;
    currentRoleFilter = roleFilter.value;
    currentPage = 1;
    renderJobs();
}
searchInput.addEventListener("input", handleFilterChange);
companyFilter.addEventListener("change", handleFilterChange);
roleFilter.addEventListener("change", handleFilterChange);
prevPageBtn.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        renderJobs();
    }
});
nextPageBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(getFilteredJobs().length / jobsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderJobs();
    }
});
clearSavedBtn.addEventListener("click", () => {
    if (savedJobIds.length > 0) {
        savedJobIds = [];
        persistSavedJobs();
        showToast("All saved jobs cleared");
    }
});
// Initialize app
async function init() {
    loadingSpinner.style.display = "flex";
    allJobs = await fetchMockJobs();
    loadingSpinner.style.display = "none";
    loadSavedJobs();
    loadAppliedJobs();
    populateCompanyFilter();
    renderJobs();
    renderSavedJobsList();
    updateSavedCount();
    initDarkMode();
    closeModalBtn.addEventListener("click", closeModal);
    cancelModalBtn.addEventListener("click", closeModal);
    window.addEventListener("click", (e) => {
        if (e.target === applyModal)
            closeModal();
    });
}
init();