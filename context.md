Create a detailed plan for an autonomous coding agent creating a webapp using 3d.js and [https://github.com/Nic30/d3-hwschematic](https://github.com/Nic30/d3-hwschematic) 
It should use following json schema
[https://github.com/twobeass/AVFlowView/blob/main/src/schemas/av-wiring-graph.schema.json](https://github.com/twobeass/AVFlowView/blob/main/src/schemas/av-wiring-graph.schema.json)
Cluster every necessary step into taks and subtasks, the agent should be able to work completly autonomous!

The description of the app is following:
AVFlowView is a data‑driven “map” for audio‑visual systems that automatically turns a structured description of devices and cables into a clean, interactive wiring diagram.[1][2]
It focuses on three things at once: arranging everything neatly, drawing cables in a readable way, and making the whole picture easy to understand through color, grouping, and highlighting.[3][2]

### Core feature set  

At its heart, AVFlowView reads a structured list of rooms, devices, connection points, and cables and converts that into a visual overview where every box and line has a clear meaning.[2][1]
Each device can carry details such as manufacturer, model, category, status (for example existing vs. planned) and a human label, which makes the diagram useful both for design and for documentation.[3][2]

The tool automatically arranges devices in a logical order (left‑to‑right or top‑to‑bottom) and organizes them into levels so that the signal paths read like a story from “source” to “destination”.[1][2]
This automatic layout avoids the typical “spaghetti” look of hand‑drawn diagrams and saves the time normally spent nudging every icon into place.[4][2]

Cables between devices are drawn as right‑angled lines with smooth corners, and the routing logic explicitly tries to go around devices instead of through them, which keeps the picture clear even when there are many connections.[2][3]
When the smart routing cannot find a perfect path, the tool falls back gracefully to simpler lines, so there is always a readable result rather than a broken diagram.[1][2]

Devices and cables are consistently color‑coded by category, for example audio, video, network, control, or power, so your eyes can quickly separate different signal families in complex systems.[5][2]
This color language is centralized, meaning that changes to the color rules apply across the entire diagram, giving a unified style instead of a patchwork of ad‑hoc colors.[6][2]

### Ports, directions, and bidirectional behavior  

Each device exposes clearly named “ports” such as “SDI OUT 1” or “HDMI IN 2”, which show exactly where cables connect on that unit.[3][2]
These ports are treated as first‑class citizens with labels, types, and even connector gender, so the diagram is close to what you see on the actual hardware.[7][2]

The viewer carefully places input ports on one side and output ports on the opposite side, usually with “things that send signals” on the left and “things that receive signals” on the right for left‑to‑right layouts, mirroring common AV schematic conventions.[8][2]
This directional layout makes it much easier to follow the flow of signals without constantly checking arrows or legends.[2][1]

For connections that can work in both directions (for example some network or control links), the system looks at how that device is wired in context and chooses the most sensible side for the port so that the overall picture still looks natural.[9][2]
Under the hood this is handled in several steps, but the result for the user is that even complicated two‑way relationships are drawn in a clear, predictable way.[1][2]

### Areas, grouping, and structure  

AVFlowView supports “areas” as special containers without their own ports, used to represent rooms, racks, zones, buildings, or any other logical grouping.[10][2]
Devices can be assigned to an area, which lets you see at a glance which equipment lives together, for example “Rack 1 in Control Room” versus “Stage Left floor box”.[11][2]

These areas can be drawn around their contained devices so that the diagram visually communicates both connectivity and physical or logical location.[2][1]
You can think of this as having a floor‑plan‑like layer wrapped around a pure signal‑flow layer, which helps bridge the gap between technical wiring and real spaces.[12][2]

The layout system can take areas into account first, arranging rooms or racks in a sensible order, then placing devices inside them and finally routing cables, which results in a diagram that feels intentionally composed rather than randomly packed.[1][2]
This is especially helpful in larger projects where hundreds of devices and cables must still tell a coherent story on screen.[4][2]

### Focus, context, and interaction  

A key idea in AVFlowView is focus/context visualization: when you select a device or cable, the viewer can highlight everything within a chosen “distance” from that element.[2][1]
In practice this means you can, for example, highlight all devices and links within one or two steps of a matrix or processor and fade out the rest of the system, reducing visual noise while you work.[13][2]

This focus behavior makes it much easier to answer questions like “what is directly connected to this unit?” or “how does this source end up at that display?” without manually tracing every line.[14][2]
It is particularly powerful in dense systems such as auditoriums or multi‑room venues where looking at the entire diagram at once can be overwhelming.[9][2]

In addition to focus, the viewer is designed for typical map‑like actions such as zooming and panning, so users can move from a big‑picture overview down to port‑level detail smoothly.[15][2]
Combined with clear labels and colors, this turns the diagram into an explorable model rather than a static image.[1][2]

### Data validation and reliability  

Before the diagram is drawn, AVFlowView checks the incoming data against a strict set of rules that describe what a “correct” AV wiring description should look like.[2][1]
If required information is missing or inconsistent (for example a cable refers to a device that does not exist), this can be detected early instead of silently producing a misleading picture.[16][2]

The data model includes dedicated sections for layout preferences, areas, devices, and cables, which encourages teams to keep their information tidy and complete.[1][2]
This kind of validation is important in professional AV work, where errors in documentation can lead to costly mistakes during installation or commissioning.[3][2]

Because the viewer is entirely driven by this structured description, the same source can be reused for other purposes like reports, inventories, or automated configuration, while AVFlowView stays focused on visualization.[6][2]
That separation of “truth” (the structured data) and “view” (the diagram) is a core design choice aimed at long‑term maintainability.[2][1]

### Design philosophy and visual style  

The overall look is closer to a clean engineering drawing than to a freehand sketch: wide device boxes with enough room for labels, ports aligned in tidy columns, and cables that move in horizontal and vertical segments with smooth bends.[1][2]
This style is in line with best practices for signal‑flow documentation, where clarity and repeatability matter more than artistic freedom.[17][2]

By constraining device orientation and port placement according to the chosen flow direction (left‑to‑right or top‑to‑bottom), the viewer avoids diagonal clutter and keeps the reader’s eye moving in a consistent direction.[8][2]
The combination of consistent flow, color‑coding, and grouping into areas makes it much easier for non‑specialists to grasp complex AV topologies.[2][1]

The feature set is also clearly designed with automation and AI assistance in mind: because everything is driven by structured descriptions and checked for correctness, external tools can generate or modify systems and instantly see the impact visually.[18][2]
This opens the door to workflows where designs come from templates, rule engines, or configuration databases and AVFlowView acts as the living, always‑up‑to‑date map.[6][2]

### Practical usage patterns  

In day‑to‑day work, a designer might start with an equipment list and rough idea of room layout, then enter devices, assign them to areas, and define their connections; AVFlowView then produces a readable diagram automatically.[10][2]
As the design evolves, changing a device, moving it to another rack, or rerouting a cable is simply a matter of updating the description and letting the viewer re‑layout the system.[1][2]

For documentation, teams can maintain a single “source of truth” file per project and regenerate diagrams whenever something changes, instead of editing drawings by hand.[4][2]
Because the diagram reflects both categories and status, it can serve as a combined as‑built, design proposal, and expansion plan depending on which pieces of information are filled in.[10][2]

During troubleshooting, technicians can search for the problematic device, highlight its neighborhood, and visually trace signal paths, which is significantly faster than reading through pages of text or purely tabular cable lists.[19][2]
The clean layout and consistent styling reduce cognitive load when working under time pressure, such as during live events or critical business meetings.[13][2]

Overall, AVFlowView positions itself as a structured, automation‑friendly, and visually disciplined way to design, understand, and operate AV wiring, with particular strength in readability, consistency, and focus‑driven exploration of complex systems.[2][1]

Quellen
[1] Signal Flow Diagrams Explained: A Beginner's Guide with ... [https://avsyncstudio.wordpress.com/2025/04/30/signal-flow-diagrams-explained-a-beginners-guide-with-software-examples/](https://avsyncstudio.wordpress.com/2025/04/30/signal-flow-diagrams-explained-a-beginners-guide-with-software-examples/)
[2] GitHub - twobeass/AVFlowView: JSON-driven viewer for A/V wiring schemas with auto-layout, category coloring, and focus/context visualization. Built with React Flow and ELK.js. [https://github.com/twobeass/AVFlowView](https://github.com/twobeass/AVFlowView)
[3] AV Cable Wiring Diagram - Pro Guide on Audio Visual Connections [https://xtenav.com/av-cable-wiring-diagram/](https://xtenav.com/av-cable-wiring-diagram/)
[4] The Evolution of AV Wiring Diagram Software: From Paper Sketches ... [https://avsyncstudio.wordpress.com/2025/04/04/the-evolution-of-av-wiring-diagram-software-from-paper-sketches-to-digital-precision/](https://avsyncstudio.wordpress.com/2025/04/04/the-evolution-of-av-wiring-diagram-software-from-paper-sketches-to-digital-precision/)
[5] Standard Schematic Colors : r/CommercialAV [https://www.reddit.com/r/CommercialAV/comments/lmv26p/standard_schematic_colors/](https://www.reddit.com/r/CommercialAV/comments/lmv26p/standard_schematic_colors/)
[6] Purpose-built AV design software with diagram UI - Synergy Codes [https://www.synergycodes.com/custom-av-design-and-proposal-software](https://www.synergycodes.com/custom-av-design-and-proposal-software)
[7] Audio and Video Connections Explained - Conceptdraw.com [https://www.conceptdraw.com/How-To-Guide/audio-and-video-connections-explained](https://www.conceptdraw.com/How-To-Guide/audio-and-video-connections-explained)
[8] 15 Years of AV Schematic Experience in 24 Minutes [https://www.youtube.com/watch?v=mmhqLJU8XpU](https://www.youtube.com/watch?v=mmhqLJU8XpU)
[9] Top Challenges in AV Equipment Integration and How Wiring ... [https://audiovisual.hashnode.dev/top-challenges-in-av-equipment-integration-and-how-wiring-diagram-software-solves-them-2fe41bb9fb00](https://audiovisual.hashnode.dev/top-challenges-in-av-equipment-integration-and-how-wiring-diagram-software-solves-them-2fe41bb9fb00)
[10] Step-by-Step Guide to AV Rack Wiring Diagrams - avsyncstudio [https://avsyncstudio.wordpress.com/2025/09/01/step-by-step-guide-to-av-rack-wiring-diagrams/](https://avsyncstudio.wordpress.com/2025/09/01/step-by-step-guide-to-av-rack-wiring-diagrams/)
[11] [PDF] AUDIO/VISUAL DESIGN GUIDE - Utah Valley University [https://www.uvu.edu/facilities/docs/standards-facilities/audiovisualdesignguidejune12022.pdf](https://www.uvu.edu/facilities/docs/standards-facilities/audiovisualdesignguidejune12022.pdf)
[12] AV Floor Plan [https://symbollogic.com/drawings/avfloorplan](https://symbollogic.com/drawings/avfloorplan)
[13] Why Signal Flow Diagrams are Critical to Commissioning ... [https://avfusionhorizon.weebly.com/blog/why-signal-flow-diagrams-are-critical-to-commissioning-complex-av-control-systems](https://avfusionhorizon.weebly.com/blog/why-signal-flow-diagrams-are-critical-to-commissioning-complex-av-control-systems)
[14] Basic Signal Flow Overview - Berklee Online [https://online.berklee.edu/help/en_US/audio-technologies/1769084-basic-signal-flow-overview](https://online.berklee.edu/help/en_US/audio-technologies/1769084-basic-signal-flow-overview)
[15] Beginner's Guide: How to Use the Best Wiring Diagram Software ... [https://techwaveav.alboompro.com/post/285011-beginner-s-guide-how-to-use-the-best-wiring-diagram-software-like-a-pro](https://techwaveav.alboompro.com/post/285011-beginner-s-guide-how-to-use-the-best-wiring-diagram-software-like-a-pro)
[16] Why Wiring Diagrams Are Essential for AV Systems - LinkedIn [https://www.linkedin.com/posts/avsolutionhub_audiovisual-avindustry-avpros-activity-7373391979109412864-bXrm](https://www.linkedin.com/posts/avsolutionhub_audiovisual-avindustry-avpros-activity-7373391979109412864-bXrm)
[17] Top 10 Signal Flow Diagram Software Tools for Engineers [https://audiovisual.hashnode.dev/top-10-signal-flow-diagram-software-tools-for-engineers](https://audiovisual.hashnode.dev/top-10-signal-flow-diagram-software-tools-for-engineers)
[18] Introducing AI Auto-Layout, powered by Flux Copilot [https://www.flux.ai/p/blog/introducing-ai-auto-layout](https://www.flux.ai/p/blog/introducing-ai-auto-layout)
[19] Troubleshooting Audio Visual Equipment [https://cie-group.com/how-to-av/videos-and-blogs/troublehooting-av](https://cie-group.com/how-to-av/videos-and-blogs/troublehooting-av)
[20] The Role of AV Wiring Diagram Software in Sustainable Building ... [https://avfusionhorizon.weebly.com/blog/the-role-of-av-wiring-diagram-software-in-sustainable-building-design](https://avfusionhorizon.weebly.com/blog/the-role-of-av-wiring-diagram-software-in-sustainable-building-design)
[21] Best AV Connection Diagram Software and Tool For Cable Labeling ... [https://programminginsider.com/best-av-connection-diagram-software-and-tool-for-cable-labeling-styling-and-scheduling/](https://programminginsider.com/best-av-connection-diagram-software-and-tool-for-cable-labeling-styling-and-scheduling/)
[22] Importance of wiring diagrams - Autodata Group NZ [https://www.autodata-group.com/nz/importance-of-wiring-diagrams/](https://www.autodata-group.com/nz/importance-of-wiring-diagrams/)
[23] Auto Layout [https://reactflow.dev/examples/layout/auto-layout](https://reactflow.dev/examples/layout/auto-layout)
[24] Wiring Color Codes | Color Codes | Electronics Textbook [https://www.allaboutcircuits.com/textbook/reference/chpt-2/wiring-color-codes/](https://www.allaboutcircuits.com/textbook/reference/chpt-2/wiring-color-codes/)
[25] Top 7 Single Line Diagram Software Options in 2025 - theAVnews [https://theavnews.mozellosite.com/blog/params/post/5090978/top-7-single-line-diagram-software-options-in-2025](https://theavnews.mozellosite.com/blog/params/post/5090978/top-7-single-line-diagram-software-options-in-2025)
[26] wire color codes [http://www.proav.de/power/mains-color-codes.html](http://www.proav.de/power/mains-color-codes.html)
[27] Top Free 5 Signal Flow Diagram Software for Audio ... [https://xtenav.com/signal-flow-diagram-software/](https://xtenav.com/signal-flow-diagram-software/)
[28] Audio signal flow diagram software. : r/techtheatre [https://www.reddit.com/r/techtheatre/comments/ul5nk5/audio_signal_flow_diagram_software/](https://www.reddit.com/r/techtheatre/comments/ul5nk5/audio_signal_flow_diagram_software/)