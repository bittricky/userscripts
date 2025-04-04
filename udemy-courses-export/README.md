# Udemy Course Exporter

A userscript that extracts information about your enrolled Udemy courses and exports it as JSON data. This makes it easy to create a personal catalog of your courses for use in tools like Notion, Airtable, or any other system that could accept JSON data.

## Features

- **Universal Compatibility**: Works on all Udemy learning and course pages
- **Smart Course Detection**: Accurately identifies and extracts course information
- **Comprehensive Data**: Extracts course titles, progress percentages, URLs, instructor names, and image URLs
- **Modern UI**: Floating button with hover effects for easy access
- **One-Click Export**: Copies formatted JSON data to clipboard with a single click

## Installation

### Prerequisites

You need a userscript manager extension installed in your browser:

- [Tampermonkey](https://www.tampermonkey.net/) (recommended, works on Chrome, Firefox, Safari, Edge)
- [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) (Firefox only)
- [Violentmonkey](https://violentmonkey.github.io/) (Chrome, Firefox, Edge)

### Installation Steps

1. Ensure you have a userscript manager installed (see above)
2. Visit the raw script URL: [udemy-courses-export.js](https://github.com/bittricky/userscripts/raw/main/udemy-courses-export/udemy-courses-export.js)
3. Your userscript manager should detect the script and prompt you to install it
4. Click "Install" or "OK" to complete the installation

Alternatively, you can manually create a new script in your userscript manager and copy-paste the contents of `udemy-courses-export.js`.

## Usage

1. Navigate to your Udemy "My Learning" page at [https://www.udemy.com/home/my-courses/learning/](https://www.udemy.com/home/my-courses/learning/)
2. Look for the purple "Export Courses" button in the bottom right corner of the page
3. Click the button to extract your course information
4. A confirmation alert will appear when your courses have been copied to the clipboard
5. Paste the JSON data into your desired application (Notion, text editor, etc.)

## JSON Data Format

The exported JSON data follows this structure:

```json
[
  {
    "title": "Course Title",
    "progress": "25%",
    "link": "https://www.udemy.com/course/course-slug/",
    "instructors": "Instructor Name(s)",
    "imageUrl": "https://img-c.udemycdn.com/course/240x135/course-image.jpg"
  },
  // Additional courses...
]
```

## Technical Details

### How It Works

The userscript performs the following operations:

1. **Initialization**: Sets up a MutationObserver to ensure the export button is always available, even when Udemy's single-page application changes the DOM

2. **Course Detection**: When the export button is clicked, the script:
   - Locates the course card grid container
   - Finds all course cards within the container
   - Extracts relevant information from each card using DOM selectors

3. **Data Extraction**: For each course, the script extracts:
   - Title from the course title element
   - Progress percentage from either the progress meter or text
   - Course URL from the title link
   - Instructor names from the instructor list element
   - Course image URL from the thumbnail

4. **Data Export**: The collected data is formatted as JSON and copied to the clipboard

### Key Components

- **getCourses()**: Core function that extracts course data from the DOM
- **createIconSVG()**: Creates the Font Awesome file-export SVG icon for the button
- **injectExportButton()**: Creates and positions the floating export button
- **MutationObserver**: Ensures the button is re-added if it disappears during page navigation

## Customization

You can modify the script to customize its behavior:

- Change the button appearance by editing the style properties in the `injectExportButton()` function
- Modify the data extraction logic in `getCourses()` to collect additional information
- Adjust the position of the floating button by changing the `bottom` and `right` values
