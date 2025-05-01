import titleImage from '../assets/docs/title-image.jpg';
import deviceOverview from '../assets/docs/device-overview.png';
import powerLeds from '../assets/docs/power-leds.jpg';
import powerConnection from '../assets/docs/power-connection.jpg';
import loadingGames from '../assets/docs/loading-games.png';
import deviceControls from '../assets/docs/device-controls.jpg';
import specialMode from '../assets/docs/special-mode.jpg';
import specialModeControls from '../assets/docs/special-mode-controls.jpg';
import timeTravel from '../assets/docs/time-travel.jpg';
import firmwareUpgrade from '../assets/docs/firmware-upgrade.png';
import microSDXCu3 from '../assets/docs/microsd-xc-u3-i.svg';
import microSDXCv90 from '../assets/docs/microsd-xc-v90-ii.svg';
import { Helmet } from 'react-helmet-async';

function Section({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="bg-gray-800 p-8 mb-12 rounded-lg border border-gray-700 shadow-lg text-left text-gray-300">
      <h2 className="text-xl font-bold text-gray-100 mb-4">{title}</h2>
      {children}
    </div>
  );
}

export default function QuickStart() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <Helmet>
        <title>Quick Start Guide - ESP32 Rainbow</title>
        <meta name="description" content="Quick Start Guide for the ESP32 Rainbow" />
      </Helmet>
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-gray-100 mb-8">
          Quick Start Guide - ESP32 Rainbow
        </h1>
        <Section title="Product Information">
          <p className="mb-2"><b>Model:</b> <span className="font-semibold">ESP-RAINBOW-01</span></p>
          <p className="mb-2"><b>Power:</b> <span className="font-semibold">5V USB-C (cable not included)</span></p>
          <p className="mb-2"><b>Manufacturer:</b> <span className="font-semibold">atomic14 (CMG Research Ltd)</span></p>
          <p className="mb-2"><b>Website:</b> <span className="font-semibold">https://esp32rainbow.com</span></p>
          <p>
            You can download the manual as a PDF <a href="/docs/quick-start.pdf" target="_blank" className="text-indigo-400 hover:text-indigo-300">here</a>.
          </p>
          <div className="mt-8 flex justify-center">
            <a href="/docs/quick-start.pdf" target="_blank">
              <img src={titleImage} alt="ESP32 Rainbow" className="max-w-full md:max-w-[300px] h-auto rounded-lg shadow-lg" />
            </a>
          </div>
        </Section>
        <Section title="What's in the box?">
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>ESP32 Rainbow with TFT display and built-in speaker</li>
            <li>Printed manual</li>
          </ul>
        </Section>
        <Section title="System Overview">
          <p className="mb-2">
            The ESP32 Rainbow is powered by an ESP32S3 microcontroller with 8MB of flash memory and 8MB of PSRAM.
          </p>
          <img src={deviceOverview} alt="ESP32 Rainbow Device" className="max-w-full h-auto" />
          <p className="mb-2">
            Audio output is provided by a 2W 8Ω speaker. Video output is provided by a TFT display (320x240 pixels, 16 bits per pixel).
          </p>
          <p className="mb-2">
            Additional storage can be provided by an optional microSD card (not included).
          </p>
        </Section>
        <Section title="Powering the device">
          <p className="mb-2">
            Connect a USB-C cable to the device. Use a 5V USB power adapter rated at 1A or higher.
          </p>
          <img src={powerConnection} alt="Power Connection" className="max-w-full h-auto rounded-lg shadow-lg" />
          <p className="mb-2 mt-4">
            To power on, slide the switch to the left after connecting the USB cable.
          </p>
          <p className="mb-2">
            There are two indicator LEDs on the device:
          </p>
          <ul className="list-disc list-inside pl-4 space-y-2 mb-4">
            <li>D3 indicates 5V power is available from the USB-C port</li>
            <li>D2 indicates that the 3V3 power supply is active</li>
          </ul>
          <img src={powerLeds} alt="ESP32 Rainbow System Overview" className="max-w-full md:max-w-[300px] h-auto rounded-lg shadow-lg" />
        </Section>
        <Section title="Loading Games">
          <p className="mb-2">
            You can load and play thousands of classic games on the ESP32 Rainbow.
          </p>
          <p className="mb-2">
            The easiest way is to use the ESP32 Rainbow website, where you can browse a large library of games and send them directly to your device over USB.
          </p>
          <p className="mb-2">
            If you already have your own collection of games, you can use the website's file browser tool to transfer them to the device, or simply copy them onto a microSD card and insert it into the device.
          </p>
          <p className="mb-2">
            The ESP32 Rainbow can use the common game formats: TAP, TZX, Z80 and SNA.
          </p>
          <p className="mb-2">
            For optimal game loading performance, we recommend converting TAP and TZX files to Z80 format using the utility provided on the ESP32 Rainbow website.
          </p>
          <img src={loadingGames} alt="Loading Games" className="max-w-full md:max-w-[300px] h-auto rounded-lg shadow-lg" />
        </Section>
        <Section title="Using the Device">
          <p className="mb-2">
            The main menu is controlled by the Spectrum cursor keys – "5"(⬅), "6"(⬇) and "7"(⬆). "6" and "7" are used to move up and down, "ENTER" to pick the menu option, and "5" to go back up the menu hierarchy.
          </p>
          <img src={deviceControls} alt="Device Controls" className="max-w-full md:max-w-[300px] h-auto rounded-lg shadow-lg" />
          <p className="mb-2">
            During gameplay, you can push the "BOOT" button to enter a special mode.
          </p>
          <img src={specialMode} alt="Special Mode" className="max-w-full md:max-w-[300px] h-auto rounded-lg shadow-lg" />
          <p className="mb-2">
            In this mode, you can:
          </p>
          <ul className="list-disc list-inside pl-4 space-y-2">
            <li>Change the volume using the "5" and "8" keys</li>
            <li>Take a snapshot by pressing "2"</li>
            <li>Activate time travel mode by pressing "1"</li>
          </ul>
          <img src={specialModeControls} alt="Special Mode Controls" className="max-w-full md:max-w-[300px] h-auto rounded-lg shadow-lg" />
          <p className="mb-2">
            In time travel mode, you can use the "5" and "8" keys to step forward and backward in time by 1 second increments. "ENTER" will resume play.
          </p>
          <img src={timeTravel} alt="Time Travel Mode" className="max-w-full md:max-w-[300px] h-auto rounded-lg shadow-lg" />
        </Section>
        <Section title="Upgrading the Firmware">
          <p className="mb-2">
            To upgrade the firmware, you can use the firmware page on the ESP32 Rainbow website. This will allow you to flash new firmware to the device.
          </p>
          <p className="mb-2">
            You can also download the source code and use PlatformIO.
          </p>
          <img src={firmwareUpgrade} alt="Firmware Upgrade" className="max-w-full h-auto rounded-lg shadow-lg" />
        </Section>
        <Section title="Optional SD Card">
          <p className="mb-2">
            The ESP32 Rainbow can use an optional microSD card for storage. The microSD card should be formatted as FAT32.
          </p>
          <p className="mb-2">
            Use a high-quality microSD card for best results and reliability. If the card is not detected, try a different card.
          </p>
          <p className="mb-2">
            We recommend cards with the following markings from reputable manufacturers such as SanDisk.
          </p>
          <div className="flex flex-row gap-4">
            <img src={microSDXCu3} alt="MicroSDXC U3" className="max-w-full md:max-w-[300px] h-auto rounded-lg invert" />
            <img src={microSDXCv90} alt="MicroSDXC V90" className="max-w-full md:max-w-[300px] h-auto rounded-lg invert" />
          </div>
          <p className="mb-2">
            These speed classes are not required for the ESP32 Rainbow, but they are a good indication of the quality of the card.
          </p>
        </Section>
        <Section title="Troubleshooting">
          <h4 className="text-lg font-semibold text-gray-100 mb-2">No display?</h4>
          <p className="mb-2">
            Check the power indicator LEDs. Both D3 and D2 should be lit.
          </p>
          <ul className="list-disc list-inside pl-4 space-y-1">
            <li>D3 not lit? Check the USB-C power supply.</li>
            <li>D2 not lit? Check that your power supply is providing 5V and has sufficient current.</li>
            <li>D3 and D2 are lit: make sure the display ribbon cable is properly seated in the socket on the PCB.</li>
          </ul>
          <h4 className="text-lg font-semibold text-gray-100 mb-2">SD card not detected?</h4>
          <p className="mb-2">
            Check the card is properly inserted and formatted as FAT32. Make sure the card is high quality. Be aware that there are many counterfeit SD cards on the market.
          </p>
          <h4 className="text-lg font-semibold text-gray-100 mb-2">Unresponsive keyboard?</h4>
          <p className="mb-2">
            The keyboard is a capacitive touch keyboard. When the device is booted, the software runs through a calibration process to detect a baseline capacitance for each key. Make sure you are not touching the keys while the device is booting.
          </p>
          <p className="mb-2">
            If the problem persists, try pressing the reset button or try power-cycling the device. Make sure the keyboard is clean and free from dust and moisture.
          </p>
          <h4 className="text-lg font-semibold text-gray-100 mb-2">Game not working?</h4>
          <p className="mb-2">
            We've done our best to try and make sure most games work – but this is not a real ZX Spectrum. There will be incompatibilities. If you find a problem, try a different version of the game. Test the game in different emulators and then open an issue on the project's GitHub repository.
          </p>
          <h4 className="text-lg font-semibold text-gray-100 mb-2">Still need help?</h4>
          <p className="mb-2">
            Head over to the ESP32 Rainbow website. If you can't find the answers you need, then you can contact us via a GitHub issue or the website.
          </p>
        </Section>
        <Section title="Software and License">
          <p className="mb-2">
            All the code for the firmware and the design files for the PCBs are completely open source and licensed under the GNU General Public License v3.0. This program is distributed WITHOUT ANY WARRANTY; see the licence for details.
          </p>
          <div className="space-y-2">
            <a href="https://github.com/atomic14/esp32-zxspectrum" className="text-indigo-400 hover:text-indigo-300 block">
              https://github.com/atomic14/esp32-zxspectrum
            </a>
            <a href="https://github.com/atomic14/esp32-zxspectrum-hardware" className="text-indigo-400 hover:text-indigo-300 block">
              https://github.com/atomic14/esp32-zxspectrum-hardware
            </a>
          </div>
          <p className="mb-2">
            "ZX Spectrum" is a trademark of Amstrad/Sky; used for descriptive purposes only.
          </p>
        </Section>
      </div>
    </div>
  )
} 