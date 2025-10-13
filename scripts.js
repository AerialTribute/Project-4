// Array of organization data
const organizations = [
    {
        name: "Stick Monkey",
        logo: "https://aerialtributeproject.org/wp-content/uploads/2024/05/Stick-Monkey.jpg",
        opportunity: "Share Time",
        link: "https://www.flystickmonkey.com",
        description: "A mobile app that connects you with other pilots looking to build time together."
    },
    {
        name: "PALS SkyHope",
        logo: "https://aerialtributeproject.org/wp-content/uploads/2024/03/Pals-SkyHope.png",
        opportunity: "Volunteer",
        link: "https://palsskyhope.org",
        description: "Free medical and compassion flights for patients and veterans."
    },
    {
        name: "Above the Clouds",
        logo: "https://aerialtributeproject.org/wp-content/uploads/2024/03/Above-the-clouds.jpg",
        opportunity: "Volunteer",
        link: "https://abovethecloudskids.org",
        description: "Provides joy and hope through flight to children and teens facing adversity."
    },
    {
        name: "Pilots to the Rescue",
        logo: "https://aerialtributeproject.org/wp-content/uploads/2024/03/Pilots-to-the-Rescue.png",
        opportunity: "Volunteer",
        link: "https://pilotstotherescue.org",
        description: "Homeless pet transport service for better adoption chances."
    },
    {
        name: "Corporate Angel Network",
        logo: "https://aerialtributeproject.org/wp-content/uploads/2024/03/CAN.jpg",
        opportunity: "Volunteer",
        link: "https://www.corpangelnetwork.org",
        description: "Eases travel stress and financial burden for cancer patients."
    },
    {
        name: "Air Charity Network",
        logo: "https://aerialtributeproject.org/wp-content/uploads/2024/03/air-charity-network-logo.jpg",
        opportunity: "Volunteer",
        link: "https://aircharitynetwork.org",
        description: "Provides transportation to specialized healthcare facilities or for crisis situations."
    },
    {
        name: "Veterans Airlift Command",
        logo: "https://aerialtributeproject.org/wp-content/uploads/2024/03/vac-logo-round@500.webp",
        opportunity: "Volunteer",
        link: "https://veteransairlift.org",
        description: "Free air transportation for post-9/11 combat wounded service members and their families."
    }
];

// Function to render organizations based on filter
function displayOrganizations(orgs) {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = ''; // Clear existing rows

    orgs.forEach(org => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td data-label="Organization"><a href="${org.link}" target="_blank" rel="noopener">${org.name}</a></td>
            <td data-label="Logo">
                <div class="img-container" style="position: relative; display: inline-block;">
                    <img class="clickable" src="${org.logo}" alt="${org.name} Logo">
                    <div class="tooltip">${org.description}</div>
                </div>
            </td>
            <td data-label="Opportunity">${org.opportunity}</td>
        `;
        
        tbody.appendChild(row);
    });
}

// Filter event listener
document.getElementById('typeFilter').addEventListener('change', function() {
    const selectedType = this.value;
    const filteredOrganizations = organizations.filter(org => 
        selectedType === 'all' || org.opportunity === selectedType
    );
    displayOrganizations(filteredOrganizations);
});



// Display all organizations on initial load
window.onload = function() {
    displayOrganizations(organizations);
};
