import React from 'react';
import { Helmet } from 'react-helmet-async';

const Compliance: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>ESP32 Rainbow - Declaration of Conformity</title>
        <meta name="description" content="ESP32 Rainbow Declaration of Conformity - CE and UKCA compliance information" />
      </Helmet>

      <div className="container mx-auto px-4 py-12 prose prose-invert max-w-4xl">
        <h1 className="text-4xl font-bold mb-12 text-center">ESP32 Rainbow Declaration of Conformity</h1>

        <div className="bg-gray-800 rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-semibold mb-6">Product and Manufacturer Information</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-700 rounded-lg overflow-hidden">
              <tbody>
                <tr className="border-b border-gray-700 bg-gray-900/50">
                  <td className="font-bold p-4 border-r border-gray-700 w-1/3">Product</td>
                  <td className="p-4">ESP32 Rainbow</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="font-bold p-4 border-r border-gray-700 w-1/3">Model Number</td>
                  <td className="p-4">ESP32-RAINBOW-01</td>
                </tr>
                <tr className="border-b border-gray-700 bg-gray-900/50">
                  <td className="font-bold p-4 border-r border-gray-700 w-1/3">Product Description</td>
                  <td className="p-4">Compact retro-style computing device with ESP32-S3 MCU, USB-C power, LCD display, built-in speaker, and microSD storage.</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="font-bold p-4 border-r border-gray-700 w-1/3">Contact Email</td>
                  <td className="p-4">chris@cmgresearch.com</td>
                </tr>
                <tr className="bg-gray-900/50">
                  <td className="font-bold p-4 border-r border-gray-700 w-1/3">Manufacturer</td>
                  <td className="p-4">CMG Research Ltd (atomic14), Flat 3, 23 Simpson Loan, Edinburgh, EH3 9GD</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4 mb-12">
          <p className="text-lg">This declaration of conformity is issued under the sole responsibility of the manufacturer.</p>
          
          <p className="text-lg">The product described above is in conformity with the relevant <strong>Union harmonisation legislation</strong> and <strong>UK statutory instruments</strong>:</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-semibold mb-6">Applicable Directives</h2>

          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-indigo-400">CE Marking (EU):</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>EMC Directive 2014/30/EU</li>
                <li>RoHS Directive 2011/65/EU (as amended by 2015/863/EU)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4 text-indigo-400">UKCA Marking (UK):</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Electromagnetic Compatibility Regulations 2016</li>
                <li>Restriction of the Use of Certain Hazardous Substances in Electrical and Electronic Equipment Regulations 2012</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-semibold mb-6">Standards Applied</h2>
          <p className="mb-4">The following harmonised standards (EN) and designated standards (BS EN) have been applied:</p>
          <ul className="list-disc list-inside space-y-3 ml-4">
            <li><strong>EN 55032:2015+A11:2020</strong> – Electromagnetic compatibility of multimedia equipment</li>
            <li><strong>EN 55035:2017+A11:2020</strong> – Immunity requirements for multimedia equipment</li>
            <li><strong>EN IEC 61000-3-2:2019</strong> – Harmonic current emissions</li>
            <li><strong>EN IEC 61000-3-3:2013+A1:2019</strong> – Voltage fluctuations and flicker</li>
            <li><strong>EN IEC 63000:2018</strong> – Technical documentation for RoHS</li>
          </ul>
        </div>

        <div className="bg-gray-800 rounded-lg p-8 mb-12">
          <p className="text-lg mb-6">Signed for and on behalf of:</p>
          <div className="space-y-2 mb-8">
            <p className="text-xl font-semibold">CMG Research Ltd</p>
            <div className="space-y-1 text-gray-300">
              <p>Place of Issue: Edinburgh, United Kingdom</p>
              <p>Date of Issue: 2025-05-01</p>
              <p>Name: Chris Greening</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-lg">
            A downloadable version of this document is available{' '}
            <a 
              href="/compliance/declaration-of-conformity.pdf" 
              className="text-indigo-400 hover:text-indigo-300 font-medium underline"
            >
              here
            </a>
          </p>
        </div>
      </div>
    </>
  );
};

export default Compliance; 