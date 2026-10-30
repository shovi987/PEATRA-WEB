"""
PEATRA - Visualizations Module
Creates Plotly charts and maps using official PEATRA design system.
Colors:
- #84E488 (Positive indicator / Light Green)
- #6BCE90 (Progress / Green)
- #54B79A (Teal accent)
- #409DA1 (Interactive Teal)
- #2F698B (Primary Blue)
- #213A75 (Navy Heading)
- #F7FAF8 (Background)
"""

import plotly.express as px
import plotly.graph_objects as go
import pandas as pd

COLORS = {
    "green_light": "#84E488",
    "green_main": "#6BCE90",
    "teal_light": "#54B79A",
    "teal_main": "#409DA1",
    "blue_main": "#2F698B",
    "navy_main": "#213A75",
    "bg_main": "#F7FAF8",
    "card_bg": "#FFFFFF",
    "border": "#E2E8F0",
    "text_dark": "#1E293B",
    "text_muted": "#64748B"
}

def plot_intervention_distribution(chosen_df):
    """
    Renders the official PEATRA donut chart for chosen interventions.
    """
    counts = chosen_df["action"].value_counts().reset_index()
    counts.columns = ["action", "count"]
    
    label_map = {
        "repair": "Perbaikan Sekat Lama",
        "new_build": "Pembangunan Sekat Baru",
        "no_intervention": "Tanpa Intervensi"
    }
    counts["label"] = counts["action"].map(label_map).fillna(counts["action"])
    
    color_map = {
        "Perbaikan Sekat Lama": COLORS["blue_main"],
        "Pembangunan Sekat Baru": COLORS["teal_main"],
        "Tanpa Intervensi": "#CBD5E1"
    }
    
    fig = px.pie(
        counts, 
        values="count", 
        names="label",
        hole=0.65,
        color="label",
        color_discrete_map=color_map
    )
    fig.update_layout(
        showlegend=True,
        margin=dict(t=10, b=10, l=10, r=10),
        height=240,
        font=dict(family="Plus Jakarta Sans, sans-serif", size=12),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)"
    )
    return fig

def plot_budget_sensitivity_curve(df_results):
    """
    Plots Budget vs Total Score comparing MILP HiGHS and Greedy Baseline.
    """
    fig = go.Figure()
    
    fig.add_trace(go.Scatter(
        x=df_results["budget"] / 1e9,
        y=df_results["milp_score"],
        mode="lines+markers",
        name="MILP Optimal (HiGHS)",
        line=dict(color=COLORS["navy_main"], width=3),
        marker=dict(size=7, color=COLORS["teal_main"])
    ))
    
    fig.add_trace(go.Scatter(
        x=df_results["budget"] / 1e9,
        y=df_results["greedy_score"],
        mode="lines+markers",
        name="Greedy Heuristic (U/C)",
        line=dict(color="#94A3B8", width=2, dash="dash"),
        marker=dict(size=6, color="#64748B")
    ))
    
    fig.update_layout(
        title="Kurva Sensitivitas Anggaran vs Manfaat Portofolio",
        xaxis_title="Anggaran (Miliar Rupiah)",
        yaxis_title="Total Skor Manfaat (Z)",
        template="plotly_white",
        margin=dict(t=40, b=30, l=30, r=20),
        height=320,
        font=dict(family="Plus Jakarta Sans, sans-serif"),
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
    )
    return fig

def plot_water_depth_comparison(pre_depth, post_depth, months=None):
    """
    Renders time-series comparison of groundwater depth before and after intervention.
    """
    if months is None:
        months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"]
        
    # Generate realistic seasonal curve
    pre_curve = [-pre_depth - 0.05 * np.sin(i) for i in range(len(months))]
    post_curve = [-post_depth - 0.03 * np.sin(i) for i in range(len(months))]
    
    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=months,
        y=pre_curve,
        name="Sebelum Restorasi",
        line=dict(color="#94A3B8", width=2, dash="dot"),
        marker=dict(size=6)
    ))
    fig.add_trace(go.Scatter(
        x=months,
        y=post_curve,
        name="Sesudah Restorasi",
        line=dict(color=COLORS["teal_main"], width=3),
        marker=dict(size=7)
    ))
    
    # Target threshold line
    fig.add_hline(y=-0.40, line_dash="dash", line_color="#EF4444", annotation_text="Ambang Batas PP 57/2016 (-0.40m)")
    
    fig.update_layout(
        title="Fluktuasi Kedalaman Muka Air Tanah (TMA)",
        yaxis_title="Elevasi Muka Air (meter)",
        template="plotly_white",
        margin=dict(t=40, b=30, l=30, r=20),
        height=280,
        font=dict(family="Plus Jakarta Sans, sans-serif"),
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
    )
    return fig
