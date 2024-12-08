The ESP32 Rainbow is our modern recreation of the Sinclair ZX Spectrum, a classic personal computer first released in 1982. It emulates the look and feel of the original 48K machine, replicating its iconic keyboard. It has a built-in color LCD, a microSD card slot for storage, and USB Type-C port for power. This project brings a beloved retro computer back to life, blending nostalgia with cutting-edge technology to create a unique device for enthusiasts and new users alike.

Relive the ZX Spectrum Experience
For those looking to relive their childhood gaming experiences, the ESP32 Rainbow emulates both the 48K and 128K ZX Spectrums. We’ve recreated the iconic keyboard in full color, and it looks amazing! Whether you’re reminiscing about classic games, remembering your first Basic program, or filling a display case with nostalgia, ESP32 Rainbow is both fully functional and nice to look at.

A Great Platform for Your Own Projects
ESP32 Rainbow is more than just a retro emulator—it’s an open-source hardware project designed for learning and innovation. With two built-in QWIIC connectors and an expansion port that provides access to the GPIO pins, the display, and the microSD card, it can easily interface with external peripherals and sensors. This flexibility, along with the powerful ESP32-S3 processor, allows for the creation of a wide range of applications, from simple experiments to more advanced projects.

 
Features & Specifications
ESP32-S3 dual-core XTensa LX7 MCU clocked at 240 MHz
320 x 280 color TFT display
40 key full-color ZX Spectrum-style touch keyboard
Emulates both 48K and 128K ZX Spectrum
Built-in 2 W, 8 ohm speaker
Simple buzzer and AY-3-8912 (three-voice sound generator) emulation
USB Type-C power and data. (You can even use ESP32 Rainbow as a USB keyboard!)
Headphone jack
microSD slot for storage
Picoblade-compatible battery connector and charging circuit
2x QWIIC connectors
Expansion port that breaks out the display, SD card, speaker, and four GPIO pins
Reset and BOOT buttons
Comparisons
ESP32 Rainbow	The Spectrum	Espectrum	PICOZX	Original
Manufacturer	CMG Research Ltd (atomic14)	Retro Games Ltd	antoniovillena	Bobricus	Sinclair Research
Underlying CPU	ESP32-S3	Unknown possibly FPGA based	ESP32	Raspberry Pi Pico	Zilog Z80
Keyboard	Touch Keyboard	Unknown, possibly with rubber keys	Rubber keys	Black and White push button	Rubber keys
Compatibility	48K and 128K ZX Spectrum	48K and 128K ZX Spectrum	Uses ESPectrum emulator	Uses pico-zxspectrum	48K
Display type	Full-color TFT	HDMI out	VGA	Full-color TFT	TV
Built-in display	320x240, 3.2-inch	None	None	320x240, 2-inch,	None
Audio	Built in speaker and audio jack	HDMI audio	Built in speaker	PIEZO sound buzzer	Built in speaker
Storage	SD Card	Unknown	SD Card	SD Card	Tape (or Microdrive if you are rich!)
Built-in games	None	48	None	None	NA
Ports	2x QWIIC connectors, GPIO Expansion port, USB Type-C	Four USB ports	USB	USB Type-C	Edge Connector
Price	$99	$120 (£89.99)	$101 (€91)	$125	Originally £175 (equivalent to ~$1000 today!)
 
 
 
 
A Few Tips For the DIY Set
If you’re feeling adventurous, you can cobble together a ZX Spectrum emulator from various development boards either by building the entire thing on a breadboard or by using one of the RP2040-based HDMI or ESP32-based VGA boards. Some of these even have built-in PS/2 ports and or USB ports so you can connect a keyboard. You can also find bare boards that are compatible with the old ZX Spectrum membrane keyboards, which can be purchased from various retro suppliers.

Below are some boards that are great for the hobbyist who wants to build their own system. This is not an exhaustive list, and most solutions will require an external PS/2 or USB keyboard as well.

FabGL VGA32
ESP32-SBC-FabGL
ESPectrum bare board
Breadboard and breakout boards
Pimoroni Pico DV Demo Base
Pimoroni Pico VGA Demo Base
 
Support & Documentation
Open Hardware: ESP32 Rainbow is open hardware available under the GNU General Public License (GPL). KiCad project files, including the schematic, PCB layout, and Bill of Materials, are all available on GitHub.
Emulator Firmware: Source code for the ZX Spectrum emulator firmware is also hosted on GitHub.
Getting Started Guides: Detailed guides will be provided to assist users in assembling, setting up, and using ESP32 Rainbow.
Support Forums: We'll be setting up a dedicated discord server for ESP32 Rainbow.
Manufacturing Plan
PCB Production: ESP32 Rainbow's printed circuit boards will be manufactured by PCBWay, a company that specializes in PCB fabrication and assembly.
Component Sourcing: We will source components from various suppliers, with a focus on ensuring availability and mitigating potential supply-chain risks.
Assembly: The PCB manufacturer in China will handle SMT assembly, and final assembly (mostly involving the speaker and the display) will take place here in the UK.
Testing: We will perform a comprehensive quality-assurance process in the UK to ensure that each unit is tested and working before we ship it.
Fulfillment & Logistics
After final assembly and testing in the UK, we will box up each batch of ESP32 Rainbow systems and send them to Crowd Supply’s fulfillment partner, Mouser Electronics, who will handle distribution to all backers. You can learn more about Crowd Supply’s fulfillment service under Ordering, Paying, and Shipping in their guide.

Risks & Challenges
We’ve been designing and manufacturing ESP32-based systems for several years and have gained considerable experience with the feature set of this chipset and with custom PCB design in general. ESP32 Rainbow has been refined over several prototypes and has been stable for some time. We’re therefore confident that we’ve built a robust and well-tested product.

We are relatively new to manufacturing at scale, however. There are many things that can go wrong with a project like this: a key component might go out of stock, for example, or we might encounter unanticipated assembly bottlenecks. These risks are why we’ve decided to outsource the major part of the production process to PCBWay. They will handle PCB fabrication and all of the SMT assembly. Final assembly and testing will take place in the UK, so we can ensure that everything is working properly.

Thankfully, we have intentionally designed ESP32 Rainbow to be easy to reproduce by anyone. That means we are not locked into any particular manufacturer or manufacturing process. There are now several PCBA fabs that provide full-color silk screen printing, and major components such as the display and the speaker are readily available. All SMD components are well stocked, and substitutes are available should that change. As a result, there should be little risk that production as a whole will encounter serious delays.