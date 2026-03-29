import { useState, useRef, useEffect } from "react";
import { Icons } from "../../../../../components/Icons";
import { Link, useNavigate } from "react-router-dom";
import {
  useGetSupportTopicsQuery,
  useLazyGetTopicDetailQuery,
  useLazyGetEntitiesQuery,
  useCreateSupportTicketMutation,
} from "../../../../../redux/supportApi/supportApi";

const getTime = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const CustomerSupport = () => {
  const navigate = useNavigate();
  const { data: apiData, isLoading } = useGetSupportTopicsQuery();
  const [fetchTopicDetail] = useLazyGetTopicDetailQuery();
  const [fetchEntities] = useLazyGetEntitiesQuery();
  const [createTicket, { isLoading: isCreatingTicket }] = useCreateSupportTicketMutation();

  const rawTopics = apiData?.data || [];
  const topics = rawTopics.filter((t, i, arr) => arr.findIndex((x) => x.topic === t.topic) === i);

  const [messages, setMessages] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [issueDetails, setIssueDetails] = useState("");
  const [selectedTopicName, setSelectedTopicName] = useState("");
  const [selectedConcernText, setSelectedConcernText] = useState("");
  const [selectedContactMethod, setSelectedContactMethod] = useState("");
  const [pendingEntityType, setPendingEntityType] = useState(null);
  const [pendingConnectVia, setPendingConnectVia] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTopicClick = async (topic) => {
    const now = getTime();
    setSelectedTopicName(topic.topic);
    setMessages((prev) => [
      ...prev,
      { id: `user-${topic._id}`, text: topic.topic, sender: "user", time: now },
    ]);

    // Call 2nd API: GET /support/topics/{topicId}
    try {
      const result = await fetchTopicDetail(topic._id).unwrap();
      const detail = result?.data;
      const webPlatform = (detail?.platform || []).find((p) => p.type === "web");
      const questionList = (detail?.supportingQuestionList?.length > 0)
        ? detail.supportingQuestionList
        : (webPlatform?.supportingQuestionList || []);
      const connectVia = detail?.connectVia || topic.connectVia || [];
      const requiresEntity = detail?.requiresEntityList || topic.requiresEntityList;
      const entityType = detail?.entityType || topic.entityType;

      if (questionList.length > 0) {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-sub-${topic._id}`,
            text: "Please select the concern you want to address.",
            sender: "bot",
            time: getTime(),
            supportingQuestions: questionList,
            connectVia,
            requiresEntity,
            entityType,
          },
        ]);
      } else if (connectVia.length > 0) {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-connect-${topic._id}`,
            text: "How would you like to connect with our support team?",
            sender: "bot",
            time: getTime(),
            connectOptions: connectVia,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { id: `bot-empty-${topic._id}`, text: "Thank you for reaching out. Our support team will get back to you shortly. 🙏", sender: "bot", time: getTime() },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `bot-err-${topic._id}`, text: "Something went wrong. Please try again.", sender: "bot", time: getTime() },
      ]);
    }
  };

  const handleSupportingQuestionClick = async (question, entityType) => {
    setSelectedConcernText(question);
    setMessages((prev) => [
      ...prev,
      { id: `user-sq-${Date.now()}`, text: question, sender: "user", time: getTime() },
    ]);

    // If entityType is not "none", fetch entities first
    if (entityType && entityType !== "none") {
      setPendingEntityType(entityType);
      try {
        const result = await fetchEntities({ entityType, page: 1, limit: 20 }).unwrap();
        const responseData = result?.data;
        const entities = responseData?.customers || responseData?.sessions || (Array.isArray(responseData) ? responseData : []);
        const pagination = responseData?.pagination;
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-entities-${Date.now()}`,
            text: "Sure 😌 Let us know which one you need help with.",
            sender: "bot",
            time: getTime(),
            entities,
            entityType,
            hasMoreEntities: pagination ? pagination.page < pagination.totalPages : false,
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { id: `bot-err-ent-${Date.now()}`, text: "Failed to load list. Please try again.", sender: "bot", time: getTime() },
        ]);
      }
    } else {
      // entityType is "none" — directly open issue popup
      setShowPopup(true);
      setIssueDetails("");
    }
  };

  const handleEntitySelect = (entity) => {
    setSelectedEntity(entity);
    setMessages((prev) => [
      ...prev,
      { id: `user-entity-${Date.now()}`, sender: "user", time: getTime(), selectedEntity: entity },
    ]);
    setShowPopup(true);
    setIssueDetails("");
  };

  const handleConnectClick = (method) => {
    setSelectedContactMethod(method);
    setShowPopup(true);
    setIssueDetails("");
  };

  const botGreeting = {
    id: "greeting",
    text: "Namaste 😊 How can we help you today?",
    sender: "bot",
    time: getTime(),
  };

  const allMessages = [botGreeting, ...messages];

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-4 p-4 border-b border-gray-100">
        <button className="p-2 bg-[#FFF5EC] border border-[#FFE8C5] rounded-xl hover:bg-[#FFEDD5] transition-colors">
          <Link to="/profile" state={{ data: "support" }}>
            <Icons.ChevronLeft size={20} className="text-[#F75801]" />
          </Link>
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Customer Support</h1>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-500">Usually replies instantly</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
        {isLoading ? (
          <div className="flex justify-center items-center h-32"><span className="text-gray-400 text-sm">Loading...</span></div>
        ) : (
          allMessages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] sm:max-w-[70%] flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                <div className={`px-5 py-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.sender === "user" ? "bg-[#FFF0E0] text-gray-800 rounded-tr-sm" : "bg-white text-gray-800 rounded-tl-sm border border-gray-100"
                }`}>
                  {/* Entity card in user bubble */}
                  {msg.selectedEntity ? (() => {
                    const ent = msg.selectedEntity;
                    const eName = `${ent.firstName || ""} ${ent.lastName || ""}`.trim() || ent.fullName || "User";
                    const eDate = ent.lastSessionDate
                      ? new Date(ent.lastSessionDate).toLocaleDateString("en-IN", { month: "short", day: "2-digit", year: "numeric" })
                        + "  " + new Date(ent.lastSessionDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : "";
                    return (
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-orange-50 flex-shrink-0">
                          {ent.profileImgUrl ? (
                            <img src={ent.profileImgUrl} alt={eName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#F75801] font-bold text-2xl">
                              {eName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-base">{eName}</h4>
                          {eDate && <p className="text-xs text-gray-500">📅 {eDate}</p>}
                        </div>
                      </div>
                    );
                  })() : msg.text}

                  {msg.id === "greeting" && topics.length > 0 && (
                    <div className="mt-4 flex flex-col gap-2">
                      {topics.map((t) => (
                        <button key={t._id} onClick={() => handleTopicClick(t)} className="text-left text-[#F75801] font-medium text-sm py-1 hover:underline">{t.topic}</button>
                      ))}
                    </div>
                  )}

                  {msg.supportingQuestions && msg.supportingQuestions.length > 0 && (
                    <div className="mt-4 flex flex-col gap-2">
                      {msg.supportingQuestions.map((sq, idx) => (
                        <button key={idx} onClick={() => handleSupportingQuestionClick(sq, msg.entityType)} className="text-left text-[#F75801] font-medium text-sm py-1 hover:underline">{sq}</button>
                      ))}
                    </div>
                  )}

                  {/* Entities list */}
                  {msg.entities && msg.entities.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {msg.entities.map((ent, idx) => {
                        const name = `${ent.firstName || ""} ${ent.lastName || ""}`.trim() || ent.fullName || ent.name || "User";
                        const lastDate = ent.lastSessionDate
                          ? new Date(ent.lastSessionDate).toLocaleDateString("en-IN", { month: "short", day: "2-digit", year: "numeric" })
                            + "  " + new Date(ent.lastSessionDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : "";
                        return (
                          <div
                            key={ent.userId || ent._id || idx}
                            onClick={() => handleEntitySelect(ent)}
                            className="bg-white border border-gray-100 p-4 rounded-xl flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                          >
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-orange-50 flex-shrink-0">
                              {ent.profileImgUrl ? (
                                <img src={ent.profileImgUrl} alt={name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#F75801] font-bold text-2xl">
                                  {name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 text-base">{name}</h4>
                              {lastDate && <p className="text-xs text-gray-500">📅 {lastDate}</p>}
                            </div>
                          </div>
                        );
                      })}
                      {msg.hasMoreEntities && (
                        <button className="text-xs text-[#F75801] font-bold mt-2 hover:underline">View More</button>
                      )}
                    </div>
                  )}

                  {msg.connectOptions && msg.connectOptions.length > 0 && (
                    <div className="mt-4 flex gap-3">
                      {msg.connectOptions.map((method) => (
                        <button
                          key={method}
                          onClick={() => handleConnectClick(method)}
                          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold border-2 transition-all hover:opacity-90"
                          style={method === "call"
                            ? { background: "linear-gradient(135deg, #f75801, #d43400)", color: "#fff", border: "none" }
                            : { background: "#fff", color: "#f75801", borderColor: "#f75801" }
                          }
                        >
                          {method === "call" ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.24 1.01l-2.2 2.2z"/></svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z"/></svg>
                          )}
                          {method === "call" ? "Call" : "Chat"}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1">{msg.time}</span>
              </div>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      {showPopup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40" onClick={() => setShowPopup(false)}>
          <div className="bg-white rounded-2xl w-[90%] max-w-md p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Issue Details</h2>
            <p className="text-sm text-gray-500 mb-4">Please describe your issue briefly so our executive can assist you better.</p>
            <textarea value={issueDetails} onChange={(e) => setIssueDetails(e.target.value)} placeholder="Describe your issue here..." rows={4} className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-[#F75801] resize-none" />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowPopup(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
              <button
                onClick={async () => {
                  try {
                    await createTicket({
                      topicName: selectedTopicName,
                      entity: pendingEntityType || "",
                      entityId: selectedEntity?._id || selectedEntity?.userId || "",
                      platform: "web",
                      issue: issueDetails.trim(),
                      contactMethod: "chat",
                    }).unwrap();
                    setShowPopup(false);
                    navigate("/recent-tickets");
                  } catch {
                    setShowPopup(false);
                    setMessages((prev) => [...prev, { id: `bot-ticket-err-${Date.now()}`, text: "Failed to create ticket. Please try again.", sender: "bot", time: getTime() }]);
                  }
                }}
                disabled={!issueDetails.trim() || isCreatingTicket}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #f75801, #d43400)" }}
              >
                {isCreatingTicket ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerSupport;
