const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
            if (node.classList && node.classList.contains('daisy-grid')) {
                addReportElement(node);
            }
        });
    });
});
observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
});

function createTemplateBtn(report) {
    const fileEl = document.createElement('div');
    // Make it nice!
    fileEl.classList =
        'selected-file daisy-button daisy-button--secondary daisy-button--small daisy-button-- daisy-button--daisys-container delay-0';
    fileEl.textContent = report.fileName;
    fileEl.style.marginRight = '5px';
    fileEl.style.marginBottom = '5px';

    fileEl.addEventListener('click', () => {
        fileEl.classList.replace(
            'daisy-button--secondary',
            'daisy-button--primary'
        );
        const selectedFiles = document.querySelectorAll('.selected-file');
        selectedFiles.forEach((selectedFile) => {
            if (selectedFile !== fileEl) {
                selectedFile.classList.remove('daisy-button--primary');
                selectedFile.classList.add('daisy-button--secondary');
            }
        });

        let parsedReport = parseMarkdown(report.content);

        setKeywordText('', '#report_title');
        setKeywordText('', '#report_vulnerability_information');
        setKeywordText('', '#report_impact');
        parsedReport.forEach((section) => {
            if (section.name == 'Impact') {
                setKeywordText(section.content.trim(), '#report_impact');
            } else if (section.name == 'Title') {
                setKeywordText(section.content.trim(), '#report_title');
            } else if (section.name == 'Severity') {
                document
                    .querySelector(
                        `.spec-rating-${section.content.trim().toLowerCase()}`
                    )
                    ?.click();
            } else {
                setKeywordText(
                    '## ' + section.name + '\n\n' + section.content.trim(),
                    '#report_vulnerability_information'
                );
            }
        });
    });
    return fileEl;
}

function parseMarkdown(content) {
    const sections = [];
    let currentSection = null;

    content.split('\n').forEach((line) => {
        if (line.startsWith('## ')) {
            const heading = line.substr(3).trim();
            currentSection = { name: heading, content: '' };
            sections.push(currentSection);
        } else if (currentSection) {
            currentSection.content += line + '\n';
        }
    });

    return sections;
}

function setKeywordText(text, id) {
    var el = document.querySelector(id);
    if (el.value === '' || text === '') el.value = text;
    else el.value = el.value + '\n\n' + text;
    var evt = document.createEvent('Events');
    evt.initEvent('change', true, true);
    el.dispatchEvent(evt);
}

function addReportElement(timeline) {
    const parentEl = document.querySelector('.daisy-timeline--medium');
    const reportList = JSON.parse(localStorage.getItem('reportList'));
    reportList?.sort((a, b) => {
        if (a.fileName < b.fileName) return -1;
        return 1;
    });

    const newReportEl = document.createElement('div');
    newReportEl.classList.add('daisy-timeline__entry');
    newReportEl.innerHTML = `
<div class="daisy-timeline__line daisy-timeline__line--medium"></div>
<div class="daisy-timeline__content">
  <div class="Spacing-module_mb-spacing-32__GCnP-">
    <div class="card">
      <div class="card__content daisy-text">
        <div class="interactive-markdown markdownable markdownable--with-margin-bottom spec-form-intro" style="position: relative;">
          <div class="card__heading">
          <div class="sc-beqWaB bpQAkP">
          <div>
          <strong>Templates</strong>
          <div class="daisy-helper-text">Select the report template.</div>
          </div>
          <button type="button" class="upload-template-btn daisy-button daisy-button--primary daisy-button--medium daisy-button-- margin-24--left">Upload Template</button>
          </div>
          </div>
          <div class="selected-files-container card__content">
          </div>

        </div>
      </div>
    </div>
  </div>
</div>
`;

    // Add the new report element to the parent element
    parentEl.insertBefore(newReportEl, parentEl.firstChild);

    const selectedFilesContainer = newReportEl.querySelector(
        '.selected-files-container'
    );
    const uploadTemplateBtn = newReportEl.querySelector('.upload-template-btn');

    // Check if reportList exists in local storage and contains at least one report
    if (reportList && reportList.length > 0) {
        // Display the filenames of loaded reports in the selected-files-container
        reportList.forEach((report) => {
            const fileEl = createTemplateBtn(report);
            selectedFilesContainer.appendChild(fileEl);
        });
    }

    // Add event listener to uploadTemplateBtn to allow uploading more templates
    uploadTemplateBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.md';
        input.multiple = true;

        input.onchange = () => {
            const files = input.files;
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const reader = new FileReader();
                reader.readAsText(file);
                reader.onload = () => {
                    const content = reader.result;
                    // Do something with the file content
                    const report = {
                        fileName: file.name.replace(/\.md$/, ''),
                        content: content,
                    };
                    // Good that you're reading this! I wouldn't trust anyone with my report templates either :)
                    // Thankfully they are only stored locally in local storage!
                    let reportList =
                        JSON.parse(localStorage.getItem('reportList')) || [];
                    const existingIndex = reportList.findIndex(
                        (item) => item.fileName === report.fileName
                    );

                    // If it exists, update the content, otherwise push the new report object to the array
                    if (existingIndex >= 0) {
                        reportList[existingIndex].content = report.content;

                        // Then replace the button with the new one
                        const selectedFiles = document.querySelectorAll(
                            '.selected-file'
                        );
                        selectedFiles.forEach((file) => {
                            if (file.innerText === report.fileName) {
                                file.remove();
                            }
                        });
                    } else {
                        reportList.push(report);
                    }

                    // Save the updated reportList to local storage
                    localStorage.setItem(
                        'reportList',
                        JSON.stringify(reportList)
                    );

                    const fileEl = createTemplateBtn(report);
                    selectedFilesContainer.appendChild(fileEl);
                };
            }
        };

        input.click();
    });
}
