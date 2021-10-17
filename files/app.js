// Theme Toggler
let darkMode = localStorage.getItem('darkMode');
const darkModeToggle = document.querySelector('#theme-toggler');

const enableDarkMode = () => {
    document.body.classList.add('darkmode');
    localStorage.setItem('darkMode', 'enabled');
}

const disableDarkMode = () => {
    document.body.classList.remove('darkmode');
    localStorage.setItem('darkMode', null);
}

if (darkMode === 'enabled') {
    enableDarkMode();
}

darkModeToggle.addEventListener('click', () => {
    darkMode = localStorage.getItem('darkMode');

    if (darkMode !== 'enabled') {
        enableDarkMode();
    } else {
        disableDarkMode();
    }
});

// Clipboard functions
function CopyToClipboard(id) {
    var r = document.createRange();
    r.selectNode(document.getElementById(id));
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(r);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();

    Swal.fire(
        'Address copied to clipboard!',
        '',
        'success'
    )
}

function PasteAddress() {
    navigator.clipboard.readText()
    .then(txt => {
        document.getElementById("vault-input").value = txt;
    })
}