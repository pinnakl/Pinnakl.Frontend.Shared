/\*\*

- Documentation for stylesheets
- By : Chris Kuan
- Created : June 3, 2016
- Revision : 1
- Last Revision: June 3, 2016
  \*\*/

# main.scss

Entry point for all SCSS files. This includes all scss including Twitter Bootstrap v4.0.0-alpha.2, Bourbon.scss - Scss library and custom made styles.

# \_components folder

This folder holds styles for each component which can be used independantly. Components include date time picker, scrollbar, buttons and etc

## \_components/\_mixins.scss

Useful and custom scss functions ( http://sass-lang.com/guide -> mixins )

## \_components/\_colors.scss

This holds all color values which will be used on the other components

## \_components/\_variables.scss

This holds variables which is being used on the other components. values includes font, sizing and etc

## \_components/reset.scss

This includes some basic styles for reseting browser's default style which are some what different on different browsers

## \_components/fonts.scss

This includes fontello icons definitions. Also includes 4 image based icon. File name seems wrong.

## \_components/\_nav.scss

Styles for main navigation

## \_components/\_forms.scss

Styles for form controls including styles for label and validation on the form

## \_components/\_dropdown.scss

This file includes styles for dropdown menu.

## \_components/\_typography.scss

This file includes font settings for the while site. Fonts for text, headings and its sizing
As of now, it includes some more styles non-related to fonts - May need to move to other files

## \_components/\_buttons.scss

This defines several styles for buttons. Also includes style for waving effect which is working together with javascript

## \_components/\_section.scss

This defines several blocks of contents as sections

## \_components/\_badge.scss

This includes one style for badge

## \_components/\_aside.scss

This defines style for left menu

## \_components/\_main-holder.scss

This includes one style for main content

## \_components/\_notification.scss

This defines styles for notification. May not being used as of now

## \_components/\_card.scss

This defines content block as cards

## \_components/\_flex.scss

This defines styles for flexbox. for more detail please refer http://www.w3schools.com/css/css3_flexbox.asp
Current layout is heavily relyed on flex mode.
This file may need organized and need to support multiple browser compatibility.

## \_components/\_filter.scss

This includes styles for filter panel

## \_components/\_datepicker.scss

This is the file for Datepicker style. This is the datetime - bootstrap picker plugin v1.6.0 (https://github.com/eternicode/bootstrap-datepicker)

## \_components/\_datepicker-kendo.scss

This includes the style for datetimepicker for Kendo UI

## \_components/\_checkbox-radio.scss

This defines style for checkbox and radio with label

## \_components/\_accordion.scss

This defines style for AngularJS multi-level accordion component ( http://lukaszwatroba.github.io/v-accordion )

## \_components/\_tabs.scss

This defines style for tab

## \_components/\_slide-panel.scss

This defines style for slider panel

# \_partials

This includes styles for header and footer

## \_partials/\_header.scss

Defines style for header area

## \_partials/\_header.scss

Defines style for footer area

# \_login.scss

Defines style for login page

# \_report.scss

Defines style for report page

# \_security.scss

Defines style for security page

# \_jscolor.scss

Defines color value and font, sizing. We have values on \_component/\_colors, \_variables, \_typography and may need to refine this file

# \_styles.scss

Defines custom style
