<?php
/**
 * Plugin Name: MGT Content
 * Description: محصولات، اسلایدر و محتوای دو زبانه جهان تجارت مجد؛ مستقل از قالب.
 * Version: 1.0.0
 * Requires at least: 6.6
 * Requires PHP: 8.1
 * Text Domain: mgt-content
 */
defined('ABSPATH') || exit;

function mgtc_register_types() {
    foreach (['mgt_product' => ['محصولات', 'محصول', 'dashicons-products'], 'mgt_slide' => ['اسلایدر', 'اسلاید', 'dashicons-images-alt2']] as $type => $labels) {
        $product = $type === 'mgt_product';
        register_post_type($type, [
            'labels' => ['name' => $labels[0], 'singular_name' => $labels[1], 'add_new_item' => 'افزودن ' . $labels[1], 'edit_item' => 'ویرایش ' . $labels[1], 'all_items' => 'همه ' . $labels[0]],
            'public' => $product, 'show_ui' => true, 'show_in_rest' => false,
            'publicly_queryable' => $product, 'exclude_from_search' => !$product,
            'menu_icon' => $labels[2], 'menu_position' => $product ? 21 : 22,
            'supports' => ['title', 'revisions', 'page-attributes'],
            'has_archive' => $product ? 'products' : false,
            'rewrite' => $product ? ['slug' => 'products', 'with_front' => false] : false,
            'delete_with_user' => false,
        ]);
    }
    register_taxonomy('mgt_category', ['mgt_product'], [
        'labels' => ['name' => 'دسته‌بندی محصولات', 'singular_name' => 'دسته‌بندی', 'add_new_item' => 'افزودن دسته‌بندی'],
        'hierarchical' => true, 'public' => false, 'show_ui' => true, 'show_admin_column' => true,
        'show_in_rest' => false, 'rewrite' => false,
    ]);
}
add_action('init', 'mgtc_register_types');

function mgtc_defaults() {
    static $defaults;
    if ($defaults === null) $defaults = json_decode(file_get_contents(__DIR__ . '/default-content.json'), true);
    return $defaults;
}
function mgtc_content() {
    return array_replace_recursive(mgtc_defaults()['content'], (array) get_option('mgt_content', []));
}
function mgtc_activate() {
    mgtc_register_types();
    add_option('mgt_content', mgtc_defaults()['content']);
    flush_rewrite_rules();
}
register_activation_hook(__FILE__, 'mgtc_activate');
register_deactivation_hook(__FILE__, 'flush_rewrite_rules');

function mgtc_fields($type) {
    $common = ['nameFa' => ['نام فارسی', 'text', 'rtl'], 'nameEn' => ['English name', 'text', 'ltr']];
    if ($type === 'mgt_slide') return [
        'titleFa' => ['عنوان فارسی', 'text', 'rtl'], 'titleEn' => ['English title', 'text', 'ltr'],
        'captionFa' => ['توضیح فارسی', 'textarea', 'rtl'], 'captionEn' => ['English caption', 'textarea', 'ltr'],
        'href' => ['لینک اسلاید (مثلاً /products/)', 'url', 'ltr'],
    ];
    return $common + [
        'sku' => ['شماره قطعه / SKU', 'text', 'ltr'],
        'descriptionFa' => ['توضیحات فارسی', 'textarea', 'rtl'], 'descriptionEn' => ['English description', 'textarea', 'ltr'],
        'specsFa' => ['مشخصات فنی فارسی', 'textarea', 'rtl'], 'specsEn' => ['English specifications', 'textarea', 'ltr'],
    ];
}
add_action('add_meta_boxes', function() {
    foreach (['mgt_product', 'mgt_slide'] as $type) add_meta_box('mgt-details', 'محتوای دو زبانه و تصاویر', 'mgtc_meta_box', $type, 'normal', 'high');
});
function mgtc_meta_box($post) {
    wp_nonce_field('mgt_save_details', 'mgt_nonce');
    echo '<p>هر دو زبان را در همین صفحه ویرایش کنید. موارد پیش‌نویس و زباله‌دان در سایت نمایش داده نمی‌شوند.</p><div class="mgt-admin-grid">';
    foreach (mgtc_fields($post->post_type) as $key => [$label, $kind, $dir]) {
        $value = get_post_meta($post->ID, '_mgt_' . $key, true);
        if (!$value && in_array($key, ['nameFa', 'titleFa'], true)) $value = $post->post_title;
        echo '<label class="mgt-field"><strong>' . esc_html($label) . '</strong>';
        if ($kind === 'textarea') echo '<textarea rows="5" dir="' . esc_attr($dir) . '" name="mgt[' . esc_attr($key) . ']">' . esc_textarea($value) . '</textarea>';
        else echo '<input type="text" dir="' . esc_attr($dir) . '" name="mgt[' . esc_attr($key) . ']" value="' . esc_attr($value) . '" maxlength="500">';
        echo '</label>';
    }
    echo '</div>';
    $ids = array_values(array_filter(array_map('absint', (array) get_post_meta($post->ID, '_mgt_images', true))));
    echo '<div class="mgt-image-picker" data-multiple="' . ($post->post_type === 'mgt_product' ? '1' : '0') . '"><h3>تصاویر</h3><input type="hidden" name="mgt_images" value="' . esc_attr(implode(',', $ids)) . '"><div class="mgt-image-previews">';
    foreach ($ids as $id) echo wp_get_attachment_image($id, 'thumbnail');
    echo '</div><button type="button" class="button mgt-pick-images">انتخاب یا بارگذاری تصویر</button> <button type="button" class="button mgt-clear-images">حذف تصاویر از این مورد</button><p class="description">ترتیب انتخاب تصاویر، ترتیب گالری است. تصویر اول در فهرست محصولات نمایش داده می‌شود.</p></div>';
    if ($post->post_type === 'mgt_slide') echo '<p>برای مخفی کردن اسلاید، وضعیت را «پیش‌نویس» کنید. ترتیب نمایش از قسمت «ویژگی‌ها ← ترتیب» تعیین می‌شود.</p>';
}
add_action('save_post', function($post_id, $post) {
    if (!in_array($post->post_type, ['mgt_product', 'mgt_slide'], true) || wp_is_post_revision($post_id) || wp_is_post_autosave($post_id)) return;
    if (!isset($_POST['mgt_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['mgt_nonce'])), 'mgt_save_details') || !current_user_can('edit_post', $post_id)) return;
    $input = isset($_POST['mgt']) && is_array($_POST['mgt']) ? wp_unslash($_POST['mgt']) : [];
    foreach (mgtc_fields($post->post_type) as $key => $field) {
        $value = isset($input[$key]) && is_scalar($input[$key]) ? (string) $input[$key] : '';
        $value = $field[1] === 'textarea' ? sanitize_textarea_field($value) : ($field[1] === 'url' ? esc_url_raw($value, ['http', 'https']) : sanitize_text_field($value));
        update_post_meta($post_id, '_mgt_' . $key, $value);
    }
    $raw_ids = isset($_POST['mgt_images']) && is_string($_POST['mgt_images']) ? explode(',', wp_unslash($_POST['mgt_images'])) : [];
    $ids = array_values(array_filter(array_unique(array_map('absint', $raw_ids)), 'wp_attachment_is_image'));
    update_post_meta($post_id, '_mgt_images', array_slice($ids, 0, $post->post_type === 'mgt_slide' ? 1 : 12));
    // Keep the native WordPress title and revisions useful without a recursive save.
    $title_key = $post->post_type === 'mgt_product' ? 'nameFa' : 'titleFa';
    if (!empty($input[$title_key]) && is_string($input[$title_key])) {
        global $wpdb;
        $wpdb->update($wpdb->posts, ['post_title' => sanitize_text_field($input[$title_key])], ['ID' => $post_id]);
        clean_post_cache($post_id);
    }
}, 10, 2);

function mgtc_content_fields() {
    return ['aboutTitle' => 'عنوان درباره ما', 'belief' => 'متن اصلی درباره شرکت', 'directorLabel' => 'عنوان پیام مدیرعامل', 'directorMessage' => 'پیام مدیرعامل', 'contactText' => 'متن تماس با ما', 'address' => 'آدرس'];
}
add_action('admin_init', function() {
    register_setting('mgt_content_group', 'mgt_content', ['type' => 'array', 'sanitize_callback' => function($input) {
        $result = mgtc_content();
        if (!is_array($input)) return $result;
        foreach (['fa', 'en'] as $lang) foreach (mgtc_content_fields() as $key => $label) {
            if (isset($input[$lang][$key]) && is_string($input[$lang][$key])) $result[$lang][$key] = sanitize_textarea_field($input[$lang][$key]);
        }
        foreach (['officePhone', 'managementPhone'] as $key) if (isset($input[$key]) && is_string($input[$key]) && preg_match('/^\+?[0-9 ()-]{5,30}$/', $input[$key])) $result[$key] = sanitize_text_field($input[$key]);
        foreach (['companyEmail', 'directorEmail'] as $key) if (isset($input[$key]) && is_string($input[$key]) && is_email($input[$key])) $result[$key] = sanitize_email($input[$key]);
        return $result;
    }]);
});
add_action('admin_menu', function() {
    add_menu_page('محتوای سایت مجد', 'محتوای سایت مجد', 'manage_options', 'mgt-content', 'mgtc_settings_page', 'dashicons-edit-page', 23);
});
function mgtc_settings_page() {
    if (!current_user_can('manage_options')) return;
    $content = mgtc_content();
    echo '<div class="wrap"><h1>متن‌های سایت و راه‌های ارتباطی</h1><p>تغییرات پس از ذخیره در سایت نمایش داده می‌شوند. ساختار و طراحی صفحات ثابت می‌ماند.</p>';
    settings_errors();
    echo '<form action="options.php" method="post">'; settings_fields('mgt_content_group');
    echo '<div class="mgt-admin-grid">';
    foreach (['fa' => 'فارسی', 'en' => 'English'] as $lang => $name) {
        echo '<section class="mgt-settings-panel"><h2>' . esc_html($name) . '</h2>';
        foreach (mgtc_content_fields() as $key => $label) echo '<label class="mgt-field"><strong>' . esc_html($label) . '</strong><textarea dir="' . ($lang === 'fa' ? 'rtl' : 'ltr') . '" rows="' . (in_array($key, ['belief', 'directorMessage'], true) ? '5' : '2') . '" name="mgt_content[' . esc_attr($lang) . '][' . esc_attr($key) . ']">' . esc_textarea($content[$lang][$key] ?? '') . '</textarea></label>';
        echo '</section>';
    }
    echo '</div><h2>راه‌های ارتباطی</h2><div class="mgt-admin-grid">';
    foreach (['officePhone' => 'تلفن شرکت', 'managementPhone' => 'تلفن مدیریت', 'companyEmail' => 'ایمیل شرکت', 'directorEmail' => 'ایمیل مدیریت'] as $key => $label) echo '<label class="mgt-field"><strong>' . esc_html($label) . '</strong><input dir="ltr" type="' . (strpos($key, 'Email') !== false ? 'email' : 'tel') . '" name="mgt_content[' . esc_attr($key) . ']" value="' . esc_attr($content[$key] ?? '') . '"></label>';
    echo '</div>'; submit_button('ذخیره و انتشار متن‌ها'); echo '</form></div>';
}

function mgtc_category_field($term = null) {
    $value = $term instanceof WP_Term ? get_term_meta($term->term_id, '_mgt_nameEn', true) : '';
    if ($term instanceof WP_Term) echo '<tr class="form-field"><th><label for="mgt-category-en">English name</label></th><td>';
    else echo '<div class="form-field"><label for="mgt-category-en">English name</label>';
    wp_nonce_field('mgt_save_category', 'mgt_category_nonce');
    echo '<input type="text" dir="ltr" id="mgt-category-en" name="mgt_nameEn" value="' . esc_attr($value) . '">';
    echo $term instanceof WP_Term ? '</td></tr>' : '</div>';
}
add_action('mgt_category_add_form_fields', 'mgtc_category_field');
add_action('mgt_category_edit_form_fields', 'mgtc_category_field');
function mgtc_save_category($id) {
    if (!current_user_can('manage_categories') || !isset($_POST['mgt_category_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['mgt_category_nonce'])), 'mgt_save_category')) return;
    if (isset($_POST['mgt_nameEn']) && is_string($_POST['mgt_nameEn'])) update_term_meta($id, '_mgt_nameEn', sanitize_text_field(wp_unslash($_POST['mgt_nameEn'])));
}
add_action('created_mgt_category', 'mgtc_save_category');
add_action('edited_mgt_category', 'mgtc_save_category');

add_action('admin_enqueue_scripts', function() {
    $screen = get_current_screen();
    if (!$screen || (!in_array($screen->post_type, ['mgt_product', 'mgt_slide'], true) && $screen->id !== 'toplevel_page_mgt-content')) return;
    wp_enqueue_media();
    wp_enqueue_style('mgt-admin', plugins_url('admin.css', __FILE__), [], filemtime(__DIR__.'/admin.css'));
    wp_enqueue_script('mgt-admin', plugins_url('admin.js', __FILE__), ['media-views'], filemtime(__DIR__.'/admin.js'), true);
});
add_filter('manage_mgt_slide_posts_columns', function($cols) { $cols['mgt_order'] = 'ترتیب'; return $cols; });
add_action('manage_mgt_slide_posts_custom_column', function($column, $id) { if ($column === 'mgt_order') echo esc_html(get_post_field('menu_order', $id)); }, 10, 2);
