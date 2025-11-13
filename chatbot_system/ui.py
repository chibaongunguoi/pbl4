import gradio as gr
import mdtex2html
import requests
import json


def postprocess(_, messages):
    if messages is None:
        return []
    for message in messages:
        message["content"] = mdtex2html.convert(message["content"])

    return messages


gr.Chatbot.postprocess = postprocess  # type: ignore


def parseText(text):
    lines = text.split("\n")
    lines = [line for line in lines if line != ""]
    count = 0
    for i, line in enumerate(lines):
        if "```" in line:
            count += 1
            items = line.split("`")
            if count % 2 == 1:
                lines[i] = f'<pre><code class="language-{items[-1]}">'
            else:
                lines[i] = "<br></code></pre>"
        else:
            if i > 0:
                if count % 2 == 1:
                    line = line.replace("`", r"\`")
                    line = line.replace("<", "&lt;")
                    line = line.replace(">", "&gt;")
                    line = line.replace(" ", "&nbsp;")
                    line = line.replace("*", "&ast;")
                    line = line.replace("_", "&lowbar;")
                    line = line.replace("-", "&#45;")
                    line = line.replace(".", "&#46;")
                    line = line.replace("!", "&#33;")
                    line = line.replace("(", "&#40;")
                    line = line.replace(")", "&#41;")
                    # line = line.replace("$", "&#36;")
                lines[i] = "<br>" + line
    text = "".join(lines)
    return text


def handleSubmitBtn(chatbot, query, chat_history):
    if not query:
        return

    chatbot.append({"role": "user", "content": parseText(query)})
    chat_history.append({"role": "user", "content": query})

    payload = {"chat_history": chat_history}
    with requests.post(
        "http://localhost:37211/api/upload", json=payload, stream=True
    ) as response:
        llm_buffer = ""
        for msg in response.iter_content(chunk_size=None, decode_unicode=True):
            if not msg:
                continue
            msg = json.loads(msg)

            if msg["type"] == "token" and (token := msg["token"]):
                if chatbot[-1]["role"] != "assistant":
                    llm_buffer = ""
                    chatbot.append(
                        {"role": "assistant", "content": parseText(llm_buffer)}
                    )
                    chat_history.append({"role": "assistant", "content": llm_buffer})

                # print(token, end="", flush=True)
                llm_buffer += token
                chatbot[-1]["content"] = parseText(llm_buffer)
                chat_history[-1]["content"] = llm_buffer
                yield chatbot

            elif msg["type"] == "chat_history" and (
                new_chat_history := msg["new_chat_history"]
            ):
                chatbot.extend(new_chat_history)
                chat_history.extend(
                    [
                        {
                            "role": dialog["role"],
                            "content": parseText(dialog["content"]),
                        }
                        for dialog in new_chat_history
                    ]
                )
                llm_buffer = ""
                yield chatbot


def handleEmptyBtn(chatbot, chat_history):
    chat_history.clear()
    chatbot.clear()
    return chatbot


with gr.Blocks() as demo:
    chatbot = gr.Chatbot(label="ChachiPT", type="messages")
    query = gr.Textbox(lines=2, label="Input")

    response = requests.post("http://localhost:37211/api/new_chat_history")
    data = response.json()

    received_chat_history = data["chat_history"]

    chat_history = gr.State(received_chat_history)

    with gr.Row():
        empty_btn = gr.Button("Clear History")
        submit_btn = gr.Button("Submit")

    submit_btn.click(
        handleSubmitBtn,
        [chatbot, query, chat_history],
        [chatbot],
    )

    empty_btn.click(
        handleEmptyBtn,
        [chatbot, chat_history],
        [chatbot],
    )

demo.queue().launch()
