// import React, { useEffect, useRef, useState } from 'react';
// import { useLocation } from 'react-router-dom';
// import { StepsList } from '../components/StepsList';
// import { FileExplorer } from '../components/FileExplorer';
// import { TabView } from '../components/TabView';
// import { CodeEditor } from '../components/CodeEditor';
// import { PreviewFrame } from '../components/PreviewFrame';
// import { StepType } from '../types';
// import type { Step, FileItem } from '../types';
// import axios from 'axios';
// import { BACKEND_URL } from '../config.ts';
// import { parseXml } from '../steps.ts';
// import { useWebContainer } from '../hooks/useWebContainer';
// // import { FileNode } from '@webcontainer/api';
// import { Loader } from '../components/Loader';

// const MOCK_FILE_CONTENT = `// This is a sample file content
// import React from 'react';

// function Component() {
//   return <div>Hello World</div>;
// }

// export default Component;`;

// export function Builder() {
//   const location = useLocation();
//   const { prompt } = location.state as { prompt: string };
//   const [userPrompt, setPrompt] = useState("");
//   const [llmMessages, setLlmMessages] = useState<{role: "user" | "assistant", content: string;}[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [templateSet, setTemplateSet] = useState(false);
//   const webcontainer = useWebContainer();

//   const [currentStep, setCurrentStep] = useState(1);
//   const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
//   const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

//   const [steps, setSteps] = useState<Step[]>([]);

//   const [files, setFiles] = useState<FileItem[]>([]);
//   const initialized = useRef(false);

//   useEffect(() => {
//     let originalFiles = [...files];
//     let updateHappened = false;
//     steps.filter(({status}) => status === "pending").map(step => {
//       updateHappened = true;
//       if (step?.type === StepType.CreateFile) {
//         let parsedPath = step.path?.split("/") ?? []; // ["src", "components", "App.tsx"]
//         let currentFileStructure = [...originalFiles]; // {}
//         let finalAnswerRef = currentFileStructure;

//         let currentFolder = ""
//         while(parsedPath.length) {
//           currentFolder =  `${currentFolder}/${parsedPath[0]}`;
//           let currentFolderName = parsedPath[0];
//           parsedPath = parsedPath.slice(1);

//           if (!parsedPath.length) {
//             // final file
//             let file = currentFileStructure.find(x => x.path === currentFolder)
//             if (!file) {
//               currentFileStructure.push({
//                 name: currentFolderName,
//                 type: 'file',
//                 path: currentFolder,
//                 content: step.code
//               })
//             } else {
//               file.content = step.code;
//             }
//           } else {
//             /// in a folder
//             let folder = currentFileStructure.find(x => x.path === currentFolder)
//             if (!folder) {
//               // create the folder
//               currentFileStructure.push({
//                 name: currentFolderName,
//                 type: 'folder',
//                 path: currentFolder,
//                 children: []
//               })
//             }

//             currentFileStructure = currentFileStructure.find(x => x.path === currentFolder)!.children!;
//           }
//         }
//         originalFiles = finalAnswerRef;
//       }

//     })

//     if (updateHappened) {

//       setFiles(originalFiles)
//       setSteps(steps => steps.map((s: Step) => {
//         return {
//           ...s,
//           status: "completed"
//         }

//       }))
//     }
//     console.log(files);
//   }, [steps, files]);

//   useEffect(() => {
//     const createMountStructure = (files: FileItem[]): Record<string, any> => {
//       const mountStructure: Record<string, any> = {};

//       const processFile = (file: FileItem, isRootFolder: boolean) => {
//         if (file.type === 'folder') {
//           // For folders, create a directory entry
//           mountStructure[file.name] = {
//             directory: file.children ?
//               Object.fromEntries(
//                 file.children.map(child => [child.name, processFile(child, false)])
//               )
//               : {}
//           };
//         } else if (file.type === 'file') {
//           if (isRootFolder) {
//             mountStructure[file.name] = {
//               file: {
//                 contents: file.content || ''
//               }
//             };
//           } else {
//             // For files, create a file entry with contents
//             return {
//               file: {
//                 contents: file.content || ''
//               }
//             };
//           }
//         }

//         return mountStructure[file.name];
//       };

//       // Process each top-level file/folder
//       files.forEach(file => processFile(file, true));

//       return mountStructure;
//     };

//     const mountStructure = createMountStructure(files);

//     // Mount the structure if WebContainer is available
//     console.log(mountStructure);
//     webcontainer?.mount(mountStructure);
//   }, [files, webcontainer]);

//   async function init() {
//     const response = await axios.post(`${BACKEND_URL}/template`, {
//       prompt: prompt.trim()
//     });
//     setTemplateSet(true);

//     const {prompts, uiPrompts} = response.data;

//     setSteps(parseXml(uiPrompts[0]).map((x: Step) => ({
//       ...x,
//       status: "pending"
//     })));

//     setLoading(true);
//     const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
//       messages: [...prompts, prompt].map(content => ({
//         role: "user",
//         content
//       }))
//     })

//     setLoading(false);

//     setSteps(s => [...s, ...parseXml(stepsResponse.data.response).map(x => ({
//       ...x,
//       status: "pending" as "pending"
//     }))]);

//     setLlmMessages([...prompts, prompt].map(content => ({
//       role: "user",
//       content
//     })));

//     setLlmMessages(x => [...x, {role: "assistant", content: stepsResponse.data.response}])
//   }

//   // useEffect(() => {
//   //   init();
//   // }, [])

//   useEffect(() => {
//   if (initialized.current) return;

//   initialized.current = true;
//   init();
// }, []);

//   return (
//     <div className="min-h-screen bg-gray-900 flex flex-col">
//       <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
//         <h1 className="text-xl font-semibold text-gray-100">Website Builder</h1>
//         <p className="text-sm text-gray-400 mt-1">Prompt: {prompt}</p>
//       </header>

//       <div className="flex-1 overflow-hidden">
//         <div className="h-full grid grid-cols-4 gap-6 p-6">
//           <div className="col-span-1 space-y-6 overflow-auto">
//             <div>
//               <div className="max-h-[75vh] overflow-scroll">
//                 <StepsList
//                   steps={steps}
//                   currentStep={currentStep}
//                   onStepClick={setCurrentStep}
//                 />
//               </div>
//               <div>
//                 <div className='flex'>
//                   <br />
//                   {(loading || !templateSet) && <Loader />}
//                   {!(loading || !templateSet) && <div className='flex'>
//                     <textarea value={userPrompt} onChange={(e) => {
//                     setPrompt(e.target.value)
//                   }} className='p-2 w-full'></textarea>
//                   <button onClick={async () => {
//                     const newMessage = {
//                       role: "user" as "user",
//                       content: userPrompt
//                     };

//                     setLoading(true);
//                     const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
//                       messages: [...llmMessages, newMessage]
//                     });
//                     setLoading(false);

//                     setLlmMessages(x => [...x, newMessage]);
//                     setLlmMessages(x => [...x, {
//                       role: "assistant",
//                       content: stepsResponse.data.response
//                     }]);

//                     setSteps(s => [...s, ...parseXml(stepsResponse.data.response).map(x => ({
//                       ...x,
//                       status: "pending" as "pending"
//                     }))]);

//                   }} className='bg-purple-400 px-4'>Send</button>
//                   </div>}
//                 </div>
//               </div>
//             </div>
//           </div>
//           <div className="col-span-1">
//               <FileExplorer
//                 files={files}
//                 onFileSelect={setSelectedFile}
//               />
//             </div>
//           <div className="col-span-2 bg-gray-900 rounded-lg shadow-lg p-4 h-[calc(100vh-8rem)]">
//             <TabView activeTab={activeTab} onTabChange={setActiveTab} />
//             <div className="h-[calc(100%-4rem)]">
//               {activeTab === 'code' ? (
//                 <CodeEditor file={selectedFile} />
//               ) : webcontainer ? (
//                 <PreviewFrame webContainer={webcontainer} files={files} />
//               ) : (
//                 <Loader />
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { StepsList } from "../components/StepsList";
import { FileExplorer } from "../components/FileExplorer";
import { TabView } from "../components/TabView";
import { CodeEditor } from "../components/CodeEditor";
import { PreviewFrame } from "../components/PreviewFrame";
import { StepType } from "../types";
import type { Step, FileItem } from "../types";
import axios from "axios";
import { BACKEND_URL } from "../config.ts";
import { parseXml } from "../steps.ts";
import { useWebContainer } from "../hooks/useWebContainer";
import { Loader } from "../components/Loader";

export function Builder() {
  const location = useLocation();

  const { prompt } = location.state as {
    prompt: string;
  };

  const [userPrompt, setPrompt] = useState("");

  const [llmMessages, setLlmMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);

  const [loading, setLoading] = useState(false);

  const [templateSet, setTemplateSet] = useState(false);

  const webcontainer = useWebContainer();

  const [currentStep, setCurrentStep] = useState(1);

  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");

  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  const [steps, setSteps] = useState<Step[]>([]);

  const [files, setFiles] = useState<FileItem[]>([]);

  // Prevent init() from running multiple times
  const initialized = useRef(false);

  // ============================================
  // Convert completed steps into file structure
  // ============================================

  useEffect(() => {
    let originalFiles = [...files];
    let updateHappened = false;

    steps
      .filter(({ status }) => status === "pending")
      .map((step) => {
        updateHappened = true;

        if (step?.type === StepType.CreateFile) {
          let parsedPath = step?.path?.split("/") ?? [];

          let currentFileStructure = [...originalFiles];

          let finalAnswerRef = currentFileStructure;

          let currentFolder = "";

          while (parsedPath.length) {
            currentFolder = `${currentFolder}/${parsedPath[0]}`;

            let currentFolderName = parsedPath[0];

            parsedPath = parsedPath.slice(1);

            // Final file
            if (!parsedPath.length) {
              let file = currentFileStructure.find(
                (x) => x.path === currentFolder,
              );

              if (!file) {
                currentFileStructure.push({
                  name: currentFolderName,
                  type: "file",
                  path: currentFolder,
                  content: step.code,
                });
              } else {
                file.content = step.code;
              }
            }

            // Folder
            else {
              let folder = currentFileStructure.find(
                (x) => x.path === currentFolder,
              );

              if (!folder) {
                currentFileStructure.push({
                  name: currentFolderName,
                  type: "folder",
                  path: currentFolder,
                  children: [],
                });
              }

              currentFileStructure = currentFileStructure.find(
                (x) => x.path === currentFolder,
              )!.children!;
            }
          }

          originalFiles = finalAnswerRef;
        }
      });

    if (updateHappened) {
      setFiles(originalFiles);

      setSteps((steps) =>
        steps.map((s: Step) => ({
          ...s,
          status: "completed",
        })),
      );
    }

    console.log(files);
  }, [steps, files]);

  // ============================================
  // Mount files into WebContainer
  // ============================================

  useEffect(() => {
    const createMountStructure = (files: FileItem[]): Record<string, any> => {
      const mountStructure: Record<string, any> = {};

      const processFile = (file: FileItem, isRootFolder: boolean) => {
        if (file.type === "folder") {
          mountStructure[file.name] = {
            directory: file.children
              ? Object.fromEntries(
                  file.children.map((child) => [
                    child.name,
                    processFile(child, false),
                  ]),
                )
              : {},
          };
        } else if (file.type === "file") {
          if (isRootFolder) {
            mountStructure[file.name] = {
              file: {
                contents: file.content || "",
              },
            };
          } else {
            return {
              file: {
                contents: file.content || "",
              },
            };
          }
        }

        return mountStructure[file.name];
      };

      files.forEach((file) => processFile(file, true));

      return mountStructure;
    };

    const mountStructure = createMountStructure(files);

    console.log(mountStructure);

    webcontainer?.mount(mountStructure);
  }, [files, webcontainer]);

  // ============================================
  // Initial AI request
  // ============================================

  async function init() {
    try {
      // Get template
      const response = await axios.post(`${BACKEND_URL}/template`, {
        prompt: prompt.trim(),
      });

      setTemplateSet(true);

      const { prompts, uiPrompts } = response.data;

      // Initial steps
      const initialSteps = parseXml(uiPrompts[0]).map((x: Step) => ({
        ...x,
        status: "pending" as "pending",
      }));

      setSteps(initialSteps);

      // Get actual generated project
      setLoading(true);

      const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
        messages: [...prompts, prompt].map((content) => ({
          role: "user",
          content,
        })),
      });

      setLoading(false);

      // Add new steps with UNIQUE IDs
      setSteps((s) => {
        const newSteps = parseXml(stepsResponse.data.response).map((x) => ({
          ...x,
          id: x.id + s.length,
          status: "pending" as "pending",
        }));

        return [...s, ...newSteps];
      });

      // Save messages
      setLlmMessages(
        [...prompts, prompt].map((content) => ({
          role: "user",
          content,
        })),
      );

      setLlmMessages((x) => [
        ...x,
        {
          role: "assistant",
          content: stepsResponse.data.response,
        },
      ]);
    } catch (error) {
      console.error("Init error:", error);

      setLoading(false);
    }
  }

  // ============================================
  // Run init only once
  // ============================================

  useEffect(() => {
    if (initialized.current) return;

    initialized.current = true;

    init();
  }, []);

  // ============================================
  // UI
  // ============================================

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-100">Website Builder</h1>

        <p className="text-sm text-gray-400 mt-1">Prompt: {prompt}</p>
      </header>

      {/* Main */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-4 gap-6 p-6">
          {/* Build Steps */}
          <div className="col-span-1 space-y-6 overflow-auto">
            <div>
              <div className="max-h-[75vh] overflow-scroll">
                <StepsList
                  steps={steps}
                  currentStep={currentStep}
                  onStepClick={setCurrentStep}
                />
              </div>

              {/* Chat */}
              <div>
                <div className="flex">
                  <br />

                  {(loading || !templateSet) && <Loader />}

                  {!(loading || !templateSet) && (
                    <div className="flex">
                      <textarea
                        value={userPrompt}
                        onChange={(e) => {
                          setPrompt(e.target.value);
                        }}
                        className="p-2 w-full"
                      />

                      <button
                        onClick={async () => {
                          try {
                            const newMessage = {
                              role: "user" as "user",
                              content: userPrompt,
                            };

                            setLoading(true);

                            const stepsResponse = await axios.post(
                              `${BACKEND_URL}/chat`,
                              {
                                messages: [...llmMessages, newMessage],
                              },
                            );

                            setLoading(false);

                            // Save user message
                            setLlmMessages((x) => [...x, newMessage]);

                            // Save AI message
                            setLlmMessages((x) => [
                              ...x,
                              {
                                role: "assistant",
                                content: stepsResponse.data.response,
                              },
                            ]);

                            // Add new steps with UNIQUE IDs
                            setSteps((s) => {
                              const newSteps = parseXml(
                                stepsResponse.data.response,
                              ).map((x) => ({
                                ...x,
                                id: x.id + s.length,
                                status: "pending" as "pending",
                              }));

                              return [...s, ...newSteps];
                            });

                            // Clear input
                            setPrompt("");
                          } catch (error) {
                            console.error("Chat error:", error);

                            setLoading(false);
                          }
                        }}
                        className="bg-purple-400 px-4"
                      >
                        Send
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* File Explorer */}
          <div className="col-span-1">
            <FileExplorer files={files} onFileSelect={setSelectedFile} />
          </div>

          {/* Code / Preview */}
          <div className="col-span-2 bg-gray-900 rounded-lg shadow-lg p-4 h-[calc(100vh-8rem)]">
            <TabView activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="h-[calc(100%-4rem)]">
              {activeTab === "code" ? (
                <CodeEditor file={selectedFile} />
              ) : webcontainer ? (
                <PreviewFrame webContainer={webcontainer} files={files} />
              ) : (
                <Loader />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
