// EcomSphere Admin Panel JavaScript

document.addEventListener('DOMContentLoaded', function () {
  // ==========================================
  // Auto-dismiss alerts after 4 seconds
  // ==========================================
  const alerts = document.querySelectorAll('.alert');
  alerts.forEach((alert) => {
    setTimeout(() => {
      alert.style.opacity = '0';
      alert.style.transition = 'opacity 0.5s';
      setTimeout(() => alert.remove(), 500);
    }, 4000);
  });

  // ==========================================
  // Image Preview on file select
  // ==========================================
  const imageInputs = document.querySelectorAll('input[type="file"][accept="image/*"]');
  imageInputs.forEach((input) => {
    input.addEventListener('change', function () {
      const file = this.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          let preview = document.getElementById('image-preview');
          if (!preview) {
            preview = document.createElement('img');
            preview.id = 'image-preview';
            preview.style.cssText = 'width:120px; height:120px; object-fit:cover; border-radius:10px; margin-top:12px; border:2px solid #334155; display:block;';
            this.parentNode.appendChild(preview);
          }
          preview.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  });

  // ==========================================
  // Confirm dialogs are handled via inline onclick
  // This adds a loading state to form submissions
  // ==========================================
  const adminForms = document.querySelectorAll('.admin-form');
  adminForms.forEach((form) => {
    form.addEventListener('submit', function () {
      const submitBtn = this.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
      }
    });
  });
  // ==========================================
  // Sidebar Toggle for Mobile
  // ==========================================
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebar = document.querySelector('.admin-sidebar');
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('open');
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 991 && sidebar.classList.contains('open')) {
        if (!sidebar.contains(e.target) && e.target !== sidebarToggle) {
          sidebar.classList.remove('open');
        }
      }
    });
  }
});
