import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from "../../utils/supabase";
import { BACKEND_URL } from '../../config';
import categoryData from '../../config/categories.json';

const MultiStepArticleForm = () => {
  const [step, setStep] = useState(0);
  const [input, setInput] = useState('');
  const [metadata, setMetadata] = useState(null);
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const navigate = useNavigate();
  const stepsIndex = ['Get Started', 'Build Article', 'Upload File', 'NFT Article'];

  // Manual form states
  const [manualTitle, setManualTitle] = useState('');
  const [manualAbstract, setManualAbstract] = useState('');
  const [manualInstitutions, setManualInstitutions] = useState('');
  const [manualKeywords, setManualKeywords] = useState('');
  const [manualMeshTerms, setManualMeshTerms] = useState('');
  const [jupyterFile, setJupyterFile] = useState(null);
  const [blockchainCitations, setBlockchainCitations] = useState(['']);
  const [manualCountry, setManualCountry] = useState('');
  const [manualInstitution, setManualInstitution] = useState('');
  const [manualCity, setManualCity] = useState('');
  


  // Fetch categories
  useEffect(() => {
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/categories/`);
      if (Array.isArray(res.data)) setCategories(res.data);
      else setCategories([]);
    } catch (err) {
      console.error("❌ Failed to fetch categories:", err);
      setCategories([]);
    }
  };
  fetchCategories();
}, []);


  // Polling progress
  useEffect(() => {
    let interval;
    if (showModal && metadata?.query_hash) {
      interval = setInterval(async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const token = session?.access_token;
          if (!token) throw new Error("No auth token");

          const res = await axios.get(`${BACKEND_URL}/api/get_progress`, {
            params: { query_hash: metadata.query_hash },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const current = res.data?.current;
          if (current != null) {
            setCitationCount(current);
            if (res.data.total > 0 && current >= res.data.total) {
              clearInterval(interval);
              setShowModal(false);
              setSuccess(true);
              setStep(2);
            }
          }
        } catch (error) {
          console.error('❌ Citation polling error:', error);
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [showModal, metadata]);





//Pubmed Query
  const handleQuery = async () => {
    try {
      setLoading(true);
          // 1. Get Supabase session and token
    const { data: { session }, error } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) throw new Error("No auth token");

    // 2. Make authenticated request
    const res = await axios.post(`${BACKEND_URL}/api/new_article/`, 
      { query: input },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Requested-With': 'XMLHttpRequest'
        },
        withCredentials: true,
      }
    );
      setMetadata(res.data);
      setSuccess(false);
    } catch (err) {
      console.error('❌ Failed to fetch article metadata:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCitationChange = (index, value) => {
    const updated = [...blockchainCitations];
    updated[index] = value;
    setBlockchainCitations(updated);
  };
  
  const addCitationField = () => {
    setBlockchainCitations([...blockchainCitations, '']);
  };
  
  const removeCitationField = (index) => {
    const updated = blockchainCitations.filter((_, i) => i !== index);
    setBlockchainCitations(updated);
  };

  const handleSubmitUnified = async () => {
    try {
      setSubmitting(true);
      setShowModal(true);

      // 🔐 1. Get Supabase auth token
      const { data: { session }, error } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        alert("You must be logged in to submit an article.");
        setSubmitting(false);
        setShowModal(false);
        return;
      }

      // 📦 2. Prepare FormData
      const formData = new FormData();
      if (input && !isManualEntry) formData.append("doi", input);
      formData.append("title", manualTitle);
      formData.append("abstract", manualAbstract);
      formData.append("institutions", manualInstitutions);
      formData.append("keywords", manualKeywords);
      formData.append("mesh_terms", manualMeshTerms);
      formData.append("category", category);
      formData.append("country", manualCountry);
      formData.append("institution", manualInstitution);
      formData.append("city", manualCity);

      if (jupyterFile) formData.append("jupyter_file", jupyterFile);
      formData.append("citation_hash_ids", blockchainCitations.filter(Boolean).join(","));

      // 🛰️ 3. Submit POST request
      const response = await axios.post(
        `${BACKEND_URL}/article/api/node_create/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Requested-With": "XMLHttpRequest"
          },
          withCredentials: true
        }
      );

      // ✅ 4. Handle response
      if (response.data && response.data.query_hash) {
        setMetadata({ query_hash: response.data.query_hash });
        navigate(`/rblock/${response.data.query_hash}`);
        setStep(2);
      } else {
        alert("❌ Article created but no hash returned.");
      }

    } catch (error) {
      console.error("❌ Failed to save article:", error.response?.data || error.message);
      alert("Something went wrong while saving the article.");
    } finally {
      setSubmitting(false);
      setShowModal(false);
    }
  };

  const handleUpload = async (e) => {
  e.preventDefault();

  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!token) {
      alert("❌ You must be logged in to upload a file.");
      return;
    }

    const form = new FormData();
    form.append("query_hash", metadata.query_hash);
    form.append("save_file", e.target.file.files[0]);

    const res = await axios.post(`${BACKEND_URL}/api/savefile/`, form, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
        "X-Requested-With": "XMLHttpRequest"
      },
      withCredentials: true
    });

    alert("✅ Jupyter file uploaded!");
    setStep(3);

  } catch (err) {
    console.error("❌ Upload error:", err.response?.data || err.message);
    alert("Failed to upload notebook.");
  }
};


  const handleFinish = () => {
    navigate(`/rblock/${metadata.query_hash}`);
  };

  function getCookie(name) {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith(name + '='))
      ?.split('=')[1];
    return cookieValue;
  }
  

  return (
    <div className="p-6 text-gray-900 dark:text-white">
      <div className="text-center text-sm text-gray-500 mb-4">
        Step {step + 1} of 4: <strong>{stepsIndex[step]}</strong>
      </div>

      <div className="flex justify-center mb-6">
        <ol className="flex space-x-4 text-xs text-gray-500">
          {stepsIndex.map((label, index) => (
            <li key={index} className={`px-2 py-1 rounded ${index === step ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
              {label}
            </li>
          ))}
        </ol>
      </div>

      {step === 0 && (
        <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <label className="flex items-center space-x-2 mb-4">
            <input
              type="checkbox"
              checked={isManualEntry}
              onChange={() => setIsManualEntry(!isManualEntry)}
              className="form-checkbox h-4 w-4 text-blue-600"
            />
            <span className="text-sm text-gray-700 dark:text-white">Enter manually (Blockchain Article)</span>
          </label>
          <h2 className="text-xl font-bold mb-4">🚀 Getting Started</h2>
          <ul className="list-disc list-inside text-sm mb-4">
            <li>PubMed ID or DOI of your article</li>
            <li>Jupyter Notebook (.ipynb or .html)</li>
            <li>Optional: NFT image</li>
            <li>Optional: ETH to mint the NFT</li>
          </ul>
          <button onClick={() => setStep(1)} className="bg-blue-600 text-white px-4 py-2 rounded w-full">Get Started</button>
        </div>
      )}

      {step === 1 && (
        <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h2 className="text-xl font-bold mb-4">🧠 Build Article</h2>

          {!isManualEntry && (
            <>
              <input type="text" placeholder="Enter PubMed ID or DOI" value={input} onChange={(e) => setInput(e.target.value)} className="border p-2 w-full mb-4" />
              <button onClick={handleQuery} className="bg-blue-600 text-white px-4 py-2 rounded w-full mb-4">
                {loading ? 'Fetching...' : 'Retrieve Metadata'}
              </button>

              {metadata && (
                <>
                  <p><strong>Title:</strong> {metadata.title}</p>
                  <p><strong>Abstract:</strong> {metadata.abstract}</p>
                  <p><strong>Authors:</strong> {metadata.authors}</p>
                  <p><strong>PMID:</strong> {metadata.pmid}</p>
                  <p><strong>DOI:</strong> {metadata.doi}</p>
                </>
              )}
              
                <div className="space-y-2">
                    <label className="block font-semibold">Blockchain Citations:</label>
                      {blockchainCitations.map((citation, index) => (
                        <div key={index} className="flex space-x-2">
                          <input
                            type="text"
                            value={citation}
                            onChange={(e) => handleCitationChange(index, e.target.value)}
                            placeholder="Enter article hash"
                            className="border p-2 w-full"
                          />
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => removeCitationField(index)}
                              className="bg-red-500 text-white px-2 rounded"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                      

                      <button
                        type="button"
                        onClick={addCitationField}
                        className="text-sm text-blue-600 mt-1 underline"
                      >
                        + Add another hash
                      </button>

                      <br></br>
                      <input
                        type="text"
                        placeholder="Country"
                        value={manualCountry}
                        onChange={(e) => setManualCountry(e.target.value)}
                        className="border p-2 w-full"
                      />

                      <input
                        type="text"
                        placeholder="Institution"
                        value={manualInstitution}
                        onChange={(e) => setManualInstitution(e.target.value)}
                        className="border p-2 w-full"
                      />

                      <input
                        type="text"
                        placeholder="City"
                        value={manualCity}
                        onChange={(e) => setManualCity(e.target.value)}
                        className="border p-2 w-full"
                      />
                </div>
                    Select Category:
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="border p-2 w-full">
                    <option value="">-- Choose a category --</option>
                    {categoryData.categories.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                  ))}
                </select>
                <input type="file" accept=".ipynb" onChange={(e) => setJupyterFile(e.target.files[0])} className="border p-2 w-full" />
                <button
                  onClick={handleSubmitUnified}
                  className="bg-green-600 text-white px-4 py-2 rounded w-full mt-2"
                  disabled={submitting}
                  >
                  {submitting ? "Submitting..." : "Submit Blockchain Article"}
                </button>
            </>
          )}

          {isManualEntry && (
            <div className="mt-4 space-y-2">
              <input type="text" placeholder="Title" value={manualTitle} onChange={(e) => setManualTitle(e.target.value)} className="border p-2 w-full" />
              <textarea placeholder="Abstract" value={manualAbstract} onChange={(e) => setManualAbstract(e.target.value)} className="border p-2 w-full" />
              <input type="text" placeholder="Institutions" value={manualInstitutions} onChange={(e) => setManualInstitutions(e.target.value)} className="border p-2 w-full" />
              <textarea placeholder="Keywords (comma-separated)" value={manualKeywords} onChange={(e) => setManualKeywords(e.target.value)} className="border p-2 w-full" />
              <textarea placeholder="MeSH Terms (comma-separated)" value={manualMeshTerms} onChange={(e) => setManualMeshTerms(e.target.value)} className="border p-2 w-full" />
              <div className="space-y-2">
                  <label className="block font-semibold">Blockchain Citations:</label>
                  {blockchainCitations.map((citation, index) => (
                    <div key={index} className="flex space-x-2">
                      <input
                        type="text"
                        value={citation}
                        onChange={(e) => handleCitationChange(index, e.target.value)}
                        placeholder="Enter article hash"
                        className="border p-2 w-full"
                      />
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeCitationField(index)}
                          className="bg-red-500 text-white px-2 rounded"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}

                <button
                  type="button"
                  onClick={addCitationField}
                  className="text-sm text-blue-600 mt-1 underline"
                  >
                  + Add another hash
                </button>
              </div>



              <input
                  type="text"
                  placeholder="Country"
                  value={manualCountry}
                  onChange={(e) => setManualCountry(e.target.value)}
                  className="border p-2 w-full"
                />

                <input
                  type="text"
                  placeholder="Institution"
                  value={manualInstitution}
                  onChange={(e) => setManualInstitution(e.target.value)}
                  className="border p-2 w-full"
                />

                <input
                  type="text"
                  placeholder="City"
                  value={manualCity}
                  onChange={(e) => setManualCity(e.target.value)}
                  className="border p-2 w-full"
                />

                  Select Category:
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="border p-2 w-full">
                <option value="">-- Choose a category --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                ))}
              </select>
              <input type="file" accept=".ipynb" onChange={(e) => setJupyterFile(e.target.files[0])} className="border p-2 w-full" />
              <button
                onClick={handleSubmitUnified}
                className="bg-green-600 text-white px-4 py-2 rounded w-full mt-2"
                disabled={submitting}
                >
                {submitting ? "Submitting..." : "Submit Blockchain Article"}
              </button>

            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h2 className="text-xl font-bold mb-4">📤 Upload Jupyter Notebook</h2>
          {!success ? (
            <form onSubmit={handleUpload}>
              <input type="file" name="file" accept=".html,.ipynb" className="mb-4" required />
              <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded w-full">Upload File</button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-green-500 font-medium">✅ File uploaded successfully!</p>
              <button onClick={() => setStep(3)} className="bg-blue-600 text-white px-4 py-2 rounded w-full">Continue to NFT Minting</button>
              <button onClick={handleFinish} className="text-sm text-gray-500 hover:text-indigo-600 underline">Skip NFT step and view Article →</button>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 text-center p-8 rounded-lg shadow-xl max-w-md">
            <h2 className="text-xl font-semibold mb-4">🚧 Please Be Patient</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              We're building your article. This may take up to 15 minutes depending on citation complexity.
            </p>
            <div className="mt-4 animate-pulse">
              <span className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
            </div>
          </div>
        </div>
      )}     
    </div>
  );
};

export default MultiStepArticleForm;
