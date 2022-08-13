CONTENTS OF THIS FILE
---------------------

 * Introduction
 * Requirements
 * Installation
 * Configuration
 * Maintainers


INTRODUCTION
------------

The LP Racing dash is a racing overlay and accompanying LEDs profile designed 
for sim racing DDUs (Data Display Units). It was developed using the 
[DDU 10.5 5-inch Dash Display with LEDs](https://www.simracingaddict.co.uk/products/vocore-5-ddu-10-5) 
by [Sim Racing Addict](https://www.simracingaddict.co.uk/).


REQUIREMENTS
------------

Dash Overlay

 * [SimHub V8.0.4 or later](https://www.simhubdash.com/)

LEDs (optional)

 * A DDU with 28 addressable LEDs
 

INSTALLATION
------------

 * Download the latest [release](https://github.com/jasonbice/sim-hub/releases)
 * Extract the contents into your SimHub installation folder, typically in 
 _C:\Program Files (x86)\SimHub_.

Optional LEDs Installation for Arduino

 * Open SimHub
 * Navigate to **Arduino** from the left-side navigation bar
 * Navigate to **RGB Leds** from the top horizontal navigation bar
 * Select **Profiles manager** under _MANAGE YOUR RGB LEDS_
 * Select **Import profile**
 * In the file selection dialog, navigate to the _DashTemplates/LP-Racing_ subfolder 
 within your SimHub installation directory, and select 
 **Any Game - LP-Racing.ledsprofile**


CONFIGURATION
-------------

Follow the instructions in the [SimHub Wiki](https://github.com/SHWotever/SimHub/wiki), 
as well as any instructions provided by your device manufacturer. In general, 
SimHub dashes can be run as on-screen overlays or run on smaller LCD devices 
(such as VOCORE, USB480, and Nextion devices). Your configuration will be specific 
to your mode of display as well as any specifics that pertain to your device.


MAINTAINERS
-----------

 * Jason Bice
