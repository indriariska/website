/* ============================================

   SCRIPT-DATA.JS - Dynamic Data Loading from API

   ============================================ */

let templatesData = null;
let testimonialsData = null;
let galleryData = null;
let teamData = null;
let settingsData = null;

async function loadTemplates() {
  try {
    const response = await API.getTemplates();
    if (response.success && response.data) {
      templatesData = {};
      response.data.forEach(template => {
        const id = template.title.replace(/\s+/g, '-').toLowerCase();
        templatesData[id] = {
          title: template.title,
          desc: template.description,
          class: `tmpl-${id}`,
          type: template.type,
          category: template.category,
          package: template.package,
          price: template.price,
          features: template.features || []
        };
      });
      console.log('Templates loaded from API:', templatesData);
      return templatesData;
    }
  } catch (error) {
    console.error('Failed to load templates from API, using fallback data:', error);
    return null;
  }
}

async function loadTestimonials() {
  try {
    const response = await API.getTestimonials();
    if (response.success && response.data) {
      testimonialsData = response.data;
      console.log('Testimonials loaded from API:', testimonialsData);
      return testimonialsData;
    }
  } catch (error) {
    console.error('Failed to load testimonials from API:', error);
    return null;
  }
}

async function loadGallery() {
  try {
    const response = await API.getGallery();
    if (response.success && response.data) {
      galleryData = response.data;
      console.log('Gallery loaded from API:', galleryData);
      return galleryData;
    }
  } catch (error) {
    console.error('Failed to load gallery from API:', error);
    return null;
  }
}

async function loadTeamMembers() {
  try {
    const response = await API.getTeamMembers();
    if (response.success && response.data) {
      teamData = response.data;
      console.log('Team members loaded from API:', teamData);
      return teamData;
    }
  } catch (error) {
    console.error('Failed to load team members from API:', error);
    return null;
  }
}

async function loadSettings() {
  try {
    const response = await API.getSettings();
    if (response.success && response.data) {
      settingsData = response.data;
      console.log('Settings loaded from API:', settingsData);
      return settingsData;
    }
  } catch (error) {
    console.error('Failed to load settings from API:', error);
    return null;
  }
}

async function loadAllData() {
  await Promise.all([
    loadTemplates(),
    loadTestimonials(),
    loadGallery(),
    loadTeamMembers(),
    loadSettings()
  ]);
}

function getTemplates() {
  return templatesData;
}

function getTestimonials() {
  return testimonialsData;
}

function getGallery() {
  return galleryData;
}

function getTeamMembers() {
  return teamData;
}

function getSettings() {
  return settingsData;
}

function getTemplateById(id) {
  return templatesData ? templatesData[id] : null;
}
